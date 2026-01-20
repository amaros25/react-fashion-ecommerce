const { Chat, ChatMessage, User, UserStats, sequelize } = require('../models');
const { Op } = require('sequelize');
const { handleError } = require('./error_handler.js');
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
            const formattedChats = rows.map(chat => {
                const chatData = chat.toJSON();
                const other = chatData.participant1Id === userId
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
            await handleError(res, error, null, "get_user_chats_error");
        }
    },

    // GET: Get a single chat by ID with paginated messages
    getChatById: async (req, res) => {
        try {
            const { chatId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const chat = await Chat.findByPk(chatId, {
                include: [
                    { model: User, as: 'participant1', attributes: ['id', 'firstName', 'lastName', 'shopName'] },
                    { model: User, as: 'participant2', attributes: ['id', 'firstName', 'lastName', 'shopName'] }
                ]
            });

            // 1. Zuerst prüfen, ob der Chat existiert
            if (!chat) throw new Error("chat_not_found");

            // 2. Dann prüfen, ob der User berechtigt ist (req.user.id kommt meist aus der Auth-Middleware)
            if (chat.participant1Id != req.user.id && chat.participant2Id != req.user.id) {
                return res.status(403).json({ error: "unauthorized_access" });
            }

            const { count, rows: messages } = await ChatMessage.findAndCountAll({
                where: { chatId },
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']]
            });

            // Rest bleibt gleich...
            const sortedMessages = messages.reverse();
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
            await handleError(res, error, null, "get_chat_by_id_error");
        }
    },

    // POST: Add a new message to a chat
    addMessage: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { chatId } = req.params;
            const { senderId, text } = req.body;
            const chat = await Chat.findByPk(chatId, { transaction: t });
            if (!chat) throw new Error("chat_not_found");
            const receiverId = chat.participant1Id == senderId
                ? chat.participant2Id
                : chat.participant1Id;
            const message = await ChatMessage.create({
                chatId,
                senderId,
                receiverId,
                text,
                isRead: false
            }, { transaction: t });
            await chat.update({
                lastMessage: text,
                updatedAt: new Date()
            }, { transaction: t });
            await UserStats.increment('unreadMessages', {
                by: 1,
                where: { userId: receiverId },
                transaction: t
            });
            await t.commit();
            res.json(message);
        } catch (error) {
            await handleError(res, error, t, "add_message_error");
        }
    },

    // POST: Create a new chat session
    createChat: async (req, res) => {
        try {
            let { participant1Id, participant2Id, type, subjectNumber, orderId, productId } = req.body;

            if (!type) throw new Error("missing_type");

            const ADMIN_ID = 1;
            if (!participant1Id) participant1Id = ADMIN_ID;
            if (!participant2Id) participant2Id = ADMIN_ID;
            if (type === "support" && !subjectNumber) {
                subjectNumber = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;
            }
            const searchWhere = {
                participant1Id,
                participant2Id,
                type
            };
            if (orderId) searchWhere.orderId = orderId;
            if (productId) searchWhere.productId = productId;
            if (subjectNumber) searchWhere.subjectNumber = subjectNumber;
            let chat = await Chat.findOne({ where: searchWhere });
            if (chat) {
                await chat.update({ updatedAt: new Date() });
                return res.status(200).json(chat);
            }
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
            await handleError(res, error, null, "create_chat_error");
        }
    },

    // PATCH: Update read status of messages
    updateReadStatus: async (req, res) => {
        const t = await sequelize.transaction();
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
                    },
                    transaction: t
                }
            );

            if (affectedCount > 0) {
                await UserStats.decrement('unreadMessages', {
                    by: affectedCount,
                    where: { userId },
                    transaction: t
                });
            }
            await t.commit();
            // 2. Den Chat ohne den kompletten Nachrichten-Ballast zurückgeben
            // (Das spart Performance, da du die Nachrichten eh schon im Frontend hast)
            res.json({ message: "status_updated", chatId, affectedCount });
        } catch (error) {
            await handleError(res, error, t, "update_read_status_error");
        }
    },
    // GET: Get unread count for seller
    getUnreadCount: async (req, res) => {
        try {
            const { userId } = req.params;
            const count = await ChatMessage.count({
                where: {
                    receiverId: userId,
                    isRead: false
                }
            });
            res.json({ unreadCount: count });
        } catch (error) {
            await handleError(res, error, null, "get_unread_count_error");
        }
    },
};

module.exports = chatController;
