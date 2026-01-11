const { Chat, ChatMessage, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Controller to handle chat-related operations for MySQL
 */
const chatController = {
    // GET: Get all chats for a user or seller
    getUserChats: async (req, res) => {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10, role } = req.query;
            const offset = (page - 1) * limit;

            let where = {};
            if (role === 'admin') {
                where[Op.or] = [{ userId: 'admin' }, { sellerId: 'admin' }];
            } else if (role === 'user' || role === 'shoper') {
                where.userId = userId;
            } else if (role === 'seller') {
                where.sellerId = userId;
            } else {
                return res.status(400).json({ message: "invalid_role" });
            }

            const { count, rows } = await Chat.findAndCountAll({
                where,
                order: [['updatedAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [{
                    model: ChatMessage, as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                }],
                distinct: true
            });

            res.json({ chats: rows, totalPages: Math.ceil(count / limit), totalChats: count });
        } catch (error) {
            console.error('Error fetching user chats:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Get a single chat by ID with paginated messages
    getChatById: async (req, res) => {
        try {
            const { chatId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const chat = await Chat.findByPk(chatId, {
                include: [{
                    model: ChatMessage, as: 'messages',
                    order: [['createdAt', 'ASC']] // Fetch all for now to mirror original slice logic
                }]
            });

            if (!chat) return res.status(404).json({ message: "chat_not_found" });

            // Emulate the slicing logic from original
            const totalMessages = chat.messages.length;
            const start = totalMessages - (page * limit);
            const end = totalMessages - ((page - 1) * limit);
            const paginatedMessages = chat.messages.slice(Math.max(start, 0), Math.max(end, 0));

            res.json({ ...chat.toJSON(), messages: paginatedMessages });
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

            const message = await ChatMessage.create({ chatId, senderId, text });

            chat.updatedAt = new Date();
            await chat.save();

            res.json(chat);
        } catch (error) {
            console.error('Error adding message:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // POST: Create a new chat session
    createChat: async (req, res) => {
        try {
            let { userId, sellerId, type, number } = req.body;
            if (!type) return res.status(400).json({ message: "missing_data" });

            if (type === "help" && !number) {
                number = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;
            }

            if (!userId && !sellerId) return res.status(400).json({ message: "missing_data" });

            if (!sellerId && userId) sellerId = 'admin';
            else if (!userId && sellerId) userId = 'admin';

            // Check for existing chat
            let chat = await Chat.findOne({
                where: { userId, sellerId, type, number: number || null }
            });

            if (chat) {
                chat.updatedAt = new Date();
                await chat.save();
                return res.status(200).json(chat);
            }

            chat = await Chat.create({
                userId,
                sellerId,
                type,
                number: number || null,
                updatedAt: new Date()
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
            await ChatMessage.update({ isRead: true }, {
                where: { chatId, isRead: false }
            });
            const chat = await Chat.findByPk(chatId, { include: [{ model: ChatMessage, as: 'messages' }] });
            res.json(chat);
        } catch (error) {
            console.error('Error updating read status:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Get unread count for seller
    getUnreadCount: async (req, res) => {
        try {
            const { sellerId } = req.params;
            const count = await ChatMessage.count({
                include: [{ model: Chat, where: { sellerId } }],
                where: {
                    isRead: false,
                    senderId: { [Op.ne]: sellerId }
                }
            });
            res.json({ unreadCount: count });
        } catch (error) {
            console.error('Error fetching unread count for seller:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: Get unread count for user
    getUnreadUserCount: async (req, res) => {
        try {
            const { userId } = req.params;
            const count = await ChatMessage.count({
                include: [{ model: Chat, where: { userId } }],
                where: {
                    isRead: false,
                    senderId: { [Op.ne]: userId }
                }
            });
            res.json({ unreadCount: count });
        } catch (error) {
            console.error('Error fetching unread count for user:', error);
            res.status(500).json({ message: "server_error" });
        }
    }
};

module.exports = chatController;
