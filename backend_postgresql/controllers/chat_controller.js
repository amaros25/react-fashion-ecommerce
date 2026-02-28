const { Chat, ChatMessage, User, UserStats, Order, sequelize } = require('../models');
const { Op } = require('sequelize');
const { handleError } = require('./error_handler.js');
/**
 * Controller to handle chat-related operations for MySQL
 */
const chatController = {


    _verifyStatus: async (userId) => {
        const stats = await UserStats.findOne({ where: { userId } });
        if (!stats) return;

        if (['banned', 'deleted', 'pending'].includes(stats.active)) {
            const error = new Error(`user_${stats.active}`);
            error.statusCode = 403;
            throw error;
        }
    },

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
            await chatController._verifyStatus(userId);

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
                    },
                    {
                        model: Order,
                        attributes: ['id', 'currentStatus', 'orderNumber']
                    }
                ],
                distinct: true
            });
            const formattedChats = await Promise.all(rows.map(async chat => {
                const chatData = chat.toJSON();
                // Add top-level orderStatus if available
                if (chatData.Order) {
                    chatData.orderStatus = chatData.Order.currentStatus;
                }
                const other = parseInt(chatData.participant1Id) === parseInt(userId)
                    ? chatData.participant2
                    : chatData.participant1;

                if (other) {
                    other.name = other.shopName || `${other.firstName} ${other.lastName}`;
                }
                chatData.otherParticipant = other;

                // Calculate unread count for this specific chat for the current user
                chatData.unreadCount = await ChatMessage.count({
                    where: {
                        chatId: chat.id,
                        receiverId: userId,
                        isRead: false
                    }
                });

                return chatData;
            }));

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
            const { offset = 0, limit = 10 } = req.query;
            const userId = req.user.id;

            const chat = await Chat.findByPk(chatId, {
                include: [
                    { model: User, as: 'participant1', attributes: ['id', 'firstName', 'lastName', 'shopName'] },
                    { model: User, as: 'participant2', attributes: ['id', 'firstName', 'lastName', 'shopName'] },
                    { model: Order, attributes: ['id', 'currentStatus', 'orderNumber'] }
                ]
            });

            if (!chat) throw new Error("chat_not_found");

            if (chat.participant1Id != userId && chat.participant2Id != userId) {
                return res.status(403).json({ error: "unauthorized_access" });
            }

            // Determine dynamic limit for initial load (offset 0)
            let fetchLimit = parseInt(limit);
            if (parseInt(offset) === 0) {
                const unreadCount = await ChatMessage.count({
                    where: {
                        chatId,
                        receiverId: userId,
                        isRead: false
                    }
                });
                // Load either all unreads or at least 10
                fetchLimit = Math.max(unreadCount, 10);
            }

            const { count, rows: messages } = await ChatMessage.findAndCountAll({
                where: { chatId },
                limit: fetchLimit,
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']]
            });

            // Return in chronological order
            const sortedMessages = messages.reverse();
            const chatData = chat.toJSON();
            // Add top-level orderStatus if available
            if (chatData.Order) {
                chatData.orderStatus = chatData.Order.currentStatus;
            }
            [chatData.participant1, chatData.participant2].forEach(p => {
                if (p) p.name = p.shopName || `${p.firstName} ${p.lastName}`;
            });

            res.json({
                ...chatData,
                messages: sortedMessages,
                totalMessages: count,
                loadedMessagesCount: parseInt(offset) + messages.length,
                limit: fetchLimit,
                offset: parseInt(offset)
            });
        } catch (error) {
            await handleError(res, error, null, "get_chat_by_id_error");
        }
    },

    // POST: Add a new message to a chat
    addMessage: async (req, res) => {
        const t = await sequelize.transaction();
        const io = req.app.get('socketio');
        try {
            const { chatId } = req.params;
            const { senderId, text } = req.body;
            await chatController._verifyStatus(senderId);

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

            if (io) {
                // Sende die komplette Nachricht an den Empfänger-Raum
                io.to(`user_${receiverId}`).emit('new_message_content', {
                    id: message.id,
                    chatId: message.chatId,
                    senderId: message.senderId,
                    text: message.text,
                    createdAt: message.createdAt
                });
            }

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
            await chatController._verifyStatus(participant1Id);

            await chatController._verifyStatus(participant2Id);

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
            const { userId, messageIds } = req.body;

            const where = {
                chatId,
                receiverId: userId,
                isRead: false
            };

            // If specific IDs are provided, only mark those
            if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
                where.id = { [Op.in]: messageIds };
            }

            const countBefore = await ChatMessage.count({ where, transaction: t });

            if (countBefore === 0) {
                await t.rollback();
                return res.json({ message: "already_read", affectedCount: 0 });
            }
            const [affectedCount] = await ChatMessage.update(
                { isRead: true },
                {
                    where,
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
            res.json({ message: "status_updated", chatId, affectedCount });
        } catch (error) {
            await handleError(res, error, t, "update_read_status_error");
        }
    },
    // GET: Get unread count for seller
    getUnreadCount: async (req, res) => {
        try {
            const { userId } = req.params;
            await chatController._verifyStatus(userId);

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
