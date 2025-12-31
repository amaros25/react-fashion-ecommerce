const mongoose = require("mongoose");



// Nachrichtenschema
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, // Sender (User oder Seller)
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false } // Standardmäßig auf false setzen (ungelesen)
});

// Chatschema
const chatSchema = new mongoose.Schema({
  userId: {
    type: String,  // Ändere hier auf String
    required: true,
  },

  sellerId: {
    type: String,  // Ändere hier auf String
    required: true,
  },

  type: {
    type: String,
    enum: ["product", "order", "help"],
    required: true
  },

  number: {
    type: String,
    default: null
  },

  messages: [messageSchema],  // Verknüpft mit dem vorherigen Message-Schema

  updatedAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model("Chat", chatSchema);
