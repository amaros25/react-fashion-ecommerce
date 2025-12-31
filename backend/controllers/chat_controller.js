const Chat = require("../models/chat");
const mongoose = require('mongoose');

exports.getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, role } = req.query;
    let filter = {};
    if (role === 'admin') {
      filter = {
        $or: [{ userId: "admin" }, { sellerId: "admin" }]
      };
    } else if (role === 'user' || role === 'shoper') {
      filter = { userId: userId };
    } else if (role === 'seller') {
      filter = { sellerId: userId };
    } else {
      return res.status(400).json({ message: "error" });
    }
    const totalChats = await Chat.countDocuments(filter);
    //console.log("totalchat: ", totalChats);
    const chats = await Chat.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const totalPages = Math.ceil(totalChats / limit);
    res.json({ chats, totalPages, totalChats });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats", error });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    const total = chat.messages.length;
    const start = total - page * limit;
    const end = total - (page - 1) * limit;
    const messages = chat.messages.slice(Math.max(start, 0), Math.max(end, 0));
    const sortedMessages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json({ ...chat.toObject(), messages: sortedMessages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat", error });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    chat.messages.push({ senderId, text });
    chat.updatedAt = new Date();
    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error adding message", error });
  }
};


exports.createChat = async (req, res) => {
  try {
    console.log("createChat req.body: ", req.body);
    let { userId, sellerId, type, number } = req.body;
    if (!type) return res.status(400).json({ message: "type fehlt" });

    // Help Center Logic: If number is not provided, generate a Support Number
    // Requirements: if user contacts -> userId provided, sellerId = "admin"
    // if seller contacts -> sellerId provided, userId = "admin"
    if (type === "help") {
      if (!number) {
        const letters = "SUP";
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        number = `${letters}-${randomNum}`;
      }
    }

    if (!userId && !sellerId) return res.status(400).json({ message: "userId or sellerId must be provided" });
    if (!sellerId && userId) {
      sellerId = "admin";
    } else if (!userId && sellerId) {
      userId = "admin";
    }
    const newChatData = {
      type,
      number: number || null,
      messages: [],
      updatedAt: new Date(),
      userId: userId,
      sellerId: sellerId
    };
    //console.log("newChatData:", newChatData);
    const newChat = new Chat(newChatData);
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Error creating chat", error });
  }
};

exports.updateReadStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    chat.messages.forEach((message) => {
      if (!message.isRead) {
        message.isRead = true;
      }
    });
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error("Error updating read status:", error);
    res.status(500).json({ message: "Error updating read status", error });
  }
};

// GET: Count unread messages for a seller
exports.getUnreadCount = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const chats = await Chat.find({ sellerId: sellerId });
    let unreadCount = 0;
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        if (!message.isRead && message.senderId.toString() !== sellerId) {
          unreadCount++;
        }
      });
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error("Error counting unread messages:", error);
    res.status(500).json({ message: "Error counting unread messages", error });
  }
};

// GET: Count unread messages for a user
exports.getUnreadUserCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ userId: userId });
    let unreadCount = 0;
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        if (!message.isRead && message.senderId.toString() !== userId) {
          unreadCount++;
        }
      });
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error("Error counting unread messages for user:", error);
    res.status(500).json({ message: "Error counting unread messages", error });
  }
};
