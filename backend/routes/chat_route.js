const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat_controller");

// GET alle Chats eines Users
router.get("/user/:userId", chatController.getUserChats);
router.get("/seller/:userId", chatController.getUserChats);

// GET einzelnen Chat
router.get("/:chatId", chatController.getChatById);

// POST neue Nachricht
router.post("/:chatId/message", chatController.addMessage);

// POST neuen Chat starten
router.post("/create", chatController.createChat);

router.patch("/:chatId/messages/read", chatController.updateReadStatus);

// GET unread message count for seller
router.get("/unread/seller/:sellerId", chatController.getUnreadCount);

// GET unread message count for user
router.get("/unread/user/:userId", chatController.getUnreadUserCount);

module.exports = router;