const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chatId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    senderId: {
        type: DataTypes.INTEGER, // References either User or Seller ID
        allowNull: false
    },
    receiverId: {
        type: DataTypes.INTEGER, // References either User or Seller ID
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'chat_messages',
    timestamps: true
});

module.exports = ChatMessage;
