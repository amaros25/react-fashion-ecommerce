const { Chat, ChatMessage, User, UserStats, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller to handle chat-related operations for MySQL
 */
const chatController = {
    // GET: Get all chats for a user or seller
    getUserChats: async (req, res) => {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            // Die Logik ist jetzt einfacher: 
            // Wir suchen alle Chats, in denen der User Teilnehmer 1 ODER Teilnehmer 2 ist.
            const where = {
                [Op.or]: [
                    { participant1Id: userId },
                    { participant2Id: userId }
                ]
            };

            const { count, rows } = await Chat.findAndCountAll({
                where,
                order: [['updatedAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: ChatMessage,
                        as: 'messages',
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    },
                    // Optional: Lade die Infos des jeweils ANDEREN Teilnehmers mit
                    {
                        model: User,
                        as: 'participant1',
                        attributes: ['id', 'firstName', 'lastName', 'shopName']
                    },
                    {
                        model: User,
                        as: 'participant2',
                        attributes: ['id', 'firstName', 'lastName', 'shopName']
                    }
                ],
                distinct: true
            });

            // Wir formatieren die Antwort kurz, damit das Frontend weiß, 
            // wer der "Partner" im Chat ist (derjenige, der man nicht selbst ist)
            const formattedChats = rows.map(chat => {
                const chatData = chat.toJSON();
                const other = chatData.participant1Id == userId
                    ? chatData.participant2
                    : chatData.participant1;

                if (other) {
                    other.name = other.shopName || `${other.firstName} ${other.lastName}`;
                }
                chatData.otherParticipant = other;
                return chatData;
            });

            res.json({
                chats: formattedChats,
                totalPages: Math.ceil(count / limit),
                totalChats: count
            });
        } catch (error) {
            console.error('Error fetching user chats:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Get a single chat by ID with paginated messages
    getChatById: async (req, res) => {
        try {
            const { chatId } = req.params;
            const { page = 1, limit = 20 } = req.query; // Höheres Limit für Chats ist oft besser
            const offset = (page - 1) * limit;

            // 1. Zuerst den Chat ohne Nachrichten laden (Metadaten)
            const chat = await Chat.findByPk(chatId, {
                include: [
                    { model: User, as: 'participant1', attributes: ['id', 'firstName', 'lastName', 'shopName'] },
                    { model: User, as: 'participant2', attributes: ['id', 'firstName', 'lastName', 'shopName'] }
                ]
            });

            if (!chat) return res.status(404).json({ message: "chat_not_found" });

            // 2. Nachrichten separat und paginiert laden
            // Wir sortieren nach DESC, um die NEUESTEN Nachrichten zuerst zu holen
            const { count, rows: messages } = await ChatMessage.findAndCountAll({
                where: { chatId },
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']]
            });

            // 3. Für das Frontend drehen wir die Nachrichten wieder um (ASC), 
            // damit die älteste Nachricht oben steht
            const sortedMessages = messages.reverse();

            // Konstruiere Namen für Teilnehmer
            const chatData = chat.toJSON();
            [chatData.participant1, chatData.participant2].forEach(p => {
                if (p) p.name = p.shopName || `${p.firstName} ${p.lastName}`;
            });

            res.json({
                ...chatData,
                messages: sortedMessages,
                totalMessages: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('Error fetching chat by ID:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // POST: Add a new message to a chat
    addMessage: async (req, res) => {
        try {
            const { chatId } = req.params;
            const { senderId, text } = req.body;

            const chat = await Chat.findByPk(chatId);
            if (!chat) return res.status(404).json({ message: "chat_not_found" });

            // 1. Empfänger ermitteln (wer ist nicht der Sender?)
            const receiverId = chat.participant1Id == senderId
                ? chat.participant2Id
                : chat.participant1Id;

            // 2. Nachricht erstellen
            const message = await ChatMessage.create({
                chatId,
                senderId,
                receiverId, // Wichtig für dein Model!
                text,
                isRead: false
            });

            // 3. Chat-Metadaten aktualisieren (lastMessage + Zeitstempel)
            await chat.update({
                lastMessage: text,
                updatedAt: new Date() // Sorgt dafür, dass der Chat in der Liste nach oben rutscht
            });

            await UserStats.increment('unreadMessages', {
                by: 1,
                where: { userId: receiverId }
            });

            // Wir geben die neue Nachricht zurück, damit das Frontend sie sofort anzeigen kann
            res.json(message);
        } catch (error) {
            console.error('Error adding message:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // POST: Create a new chat session
    createChat: async (req, res) => {
        try {
            let { participant1Id, participant2Id, type, subjectNumber, orderId, productId } = req.body;

            if (!type) return res.status(400).json({ message: "missing_type" });

            // Admin-Logik: Wenn ein Partner fehlt, wird die Admin-ID (z.B. 1) gesetzt
            const ADMIN_ID = 1;
            if (!participant1Id) participant1Id = ADMIN_ID;
            if (!participant2Id) participant2Id = ADMIN_ID;

            // Falls es ein Support-Chat ohne Nummer ist, generieren wir eine
            if (type === "support" && !subjectNumber) {
                subjectNumber = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;
            }

            // Suche prüfen: Existiert dieser Chat bereits?
            // Wir suchen nach der Kombination der Teilnehmer und dem Thema (Order/Product)
            let chat = await Chat.findOne({
                where: {
                    participant1Id,
                    participant2Id,
                    type,
                    [Op.or]: [
                        { orderId: orderId || null },
                        { subjectNumber: subjectNumber || null }
                    ]
                }
            });

            if (chat) {
                // Chat existiert bereits -> Zeitstempel aktualisieren und zurückgeben
                await chat.update({ updatedAt: new Date() });
                return res.status(200).json(chat);
            }

            // Neuen Chat erstellen
            chat = await Chat.create({
                participant1Id,
                participant2Id,
                type,
                orderId: orderId || null,
                productId: productId || null,
                subjectNumber: subjectNumber || null,
                lastMessage: "Chat gestartet"
            });

            res.status(201).json(chat);
        } catch (error) {
            console.error('Error creating chat:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // PATCH: Update read status of messages
    updateReadStatus: async (req, res) => {
        try {
            const { chatId } = req.params;
            const { userId } = req.body; // Wir müssen wissen, WER den Chat gerade liest

            // 1. Nur die Nachrichten aktualisieren, die an DIESEN User gerichtet sind
            const [affectedCount] = await ChatMessage.update(
                { isRead: true },
                {
                    where: {
                        chatId,
                        receiverId: userId, // Ganz wichtig: Nur eingehende Nachrichten!
                        isRead: false
                    }
                }
            );

            if (affectedCount > 0) {
                await UserStats.decrement('unreadMessages', {
                    by: affectedCount,
                    where: { userId }
                });
            }

            // 2. Den Chat ohne den kompletten Nachrichten-Ballast zurückgeben
            // (Das spart Performance, da du die Nachrichten eh schon im Frontend hast)
            const chat = await Chat.findByPk(chatId);

            res.json({ message: "status_updated", chatId });
        } catch (error) {
            console.error('Error updating read status:', error);
            res.status(500).json({ message: "server_error" });
        }
    },
    // GET: Get unread count for seller
    getUnreadCount: async (req, res) => {
        try {
            const { userId } = req.params; // Die ID der Person, die ihre ungelesenen Nachrichten wissen will

            const count = await ChatMessage.count({
                where: {
                    receiverId: userId, // Nachrichten, die an mich adressiert sind...
                    isRead: false       // ...und noch nicht gelesen wurden.
                }
            });

            res.json({ unreadCount: count });
        } catch (error) {
            console.error('Error fetching unread count:', error);
            res.status(500).json({ message: "server_error" });
        }
    },
};

module.exports = chatController;
