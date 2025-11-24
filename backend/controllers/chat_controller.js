const Chat = require("../models/chat");
const mongoose = require('mongoose');

// GET: alle Chats eines Nutzers (neuste zuerst) mit Pagination
exports.getUserChats = async (req, res) => {
  try {
    const { userId } = req.params; // userId aus der URL
    const { page = 1, limit = 10, role } = req.query; // Rolle kommt aus den Query-Parametern

    console.log("getUserChats userId:", userId);
    console.log("getUserChats req.query:", req.query);
    console.log("getUserChats role:", role);
    // Filter-Objekt initialisieren
    let filter = {};

    // Wenn der Benutzer ein Admin ist, sollen alle Chats angezeigt werden, sowohl für userId als auch für sellerId
    if (role === 'admin') {
      filter = { 
        $or: [{ userId: userId }, { sellerId: userId }]  // Admin kann sowohl nach userId als auch nach sellerId suchen
      };
    } else if (role === 'user') {
      filter = { userId: userId }; // Wenn der Benutzer ein User ist, dann nach userId filtern
    } else if (role === 'seller') {
      filter = { sellerId: userId }; // Wenn der Benutzer ein Seller ist, dann nach sellerId filtern
    } else {
      return res.status(400).json({ message: "Ungültige Rolle, bitte überprüfen" });
    }
    const totalChats = await Chat.countDocuments(filter);
    console.log("totalchat: ", totalChats);
    // Holen der Chats basierend auf dem Filter und der Pagination
    const chats = await Chat.find(filter)
      .sort({ updatedAt: -1 }) // Sortierung nach dem neuesten Chat
      .skip((page - 1) * limit) // Pagination
      .limit(Number(limit)) // Maximal 10 Chats pro Seite
      .lean(); // Nur die Rohdaten zurückgeben, keine Mongoose-Instanz

    const totalPages = Math.ceil(totalChats / limit);
    res.json({ chats, totalPages, totalChats });
  } catch (error) {
    console.error("Fehler beim Abrufen der Chats:", error);
    res.status(500).json({ message: "Error fetching chats", error });
  }
};

// GET: einen Chat mit Nachrichten-Pagination (max. 10 Nachrichten pro Seite)
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const total = chat.messages.length;

    // Berechne die Nachrichten, die wir für diese Seite brauchen (vom Ende rückwärts)
    const start = total - page * limit;
    const end = total - (page - 1) * limit;

    // slice richtig machen: negative Startwerte auf 0 korrigieren
    const messages = chat.messages.slice(Math.max(start, 0), Math.max(end, 0));

    // sortieren nach createdAt aufsteigend
    const sortedMessages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ ...chat.toObject(), messages: sortedMessages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat", error });
  }
};

// POST: neue Nachricht hinzufügen
exports.addMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text } = req.body; // senderId ist jetzt die ID des sendenden Nutzers (User oder Seller)
    console.log("addMessage chatId:", chatId, "senderId:", senderId, "text:", text);
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ senderId, text }); // `senderId` referenziert den Absender
    chat.updatedAt = new Date();
    await chat.save();

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error adding message", error });
  }
};

// POST: neuen Chat starten
exports.createChat = async (req, res) => {
  try {
    let { userId, sellerId, type, number } = req.body;

    // Logge die übergebenen Daten, um sicherzustellen, dass sie korrekt sind
    console.log("createChat Request Body:", req.body);

    console.log("createChat userId:", userId, "sellerId:", sellerId, "number:", number, "type:", type);

    // Validierung
    if (!type) return res.status(400).json({ message: "type fehlt" });
    if (!userId && !sellerId) return res.status(400).json({ message: "userId oder sellerId muss angegeben werden" });

    // Wenn der Chat mit einem User und dem Admin ist
    if (!sellerId && userId) {
      sellerId = "admin";  // Wenn keine sellerId vorhanden ist, setze sie auf "admin"
    } else if (!userId && sellerId) {
      userId = "admin";  // Wenn keine userId vorhanden ist, setze sie auf "admin"
    }

    // Neues Chat-Datenobjekt erstellen
    const newChatData = {
      type,
      number: number || null,
      messages: [],
      updatedAt: new Date(),
      userId: userId,
      sellerId: sellerId
    };
    console.log("newChatData:", newChatData);

    // Neues Chat-Dokument erstellen und speichern
    const newChat = new Chat(newChatData);
    await newChat.save();

    res.status(201).json(newChat);
  } catch (error) {
    console.error("Fehler beim Erstellen des Chats:", error);
    res.status(500).json({ message: "Error creating chat", error });
  }
};


 
// Markiere alle Nachrichten als gelesen
exports.updateReadStatus = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Hole den Chat aus der Datenbank
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat nicht gefunden" });
    }

    // Setze den Status "isRead" für alle Nachrichten auf true
    chat.messages.forEach((message) => {
      if (!message.isRead) {
        message.isRead = true;
      }
    });

    // Speichere die Änderungen im Chat
    await chat.save();

    // Gebe den aktualisierten Chat zurück
    res.json(chat);
  } catch (error) {
    console.error("Fehler beim Markieren der Nachrichten als gelesen:", error);
    res.status(500).json({ message: "Fehler beim Markieren der Nachrichten als gelesen", error });
  }
};
