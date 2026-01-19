const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Die beiden Personen im Chat
    participant1Id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    participant2Id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Thema des Chats
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('order', 'product', 'support'), // 'support' für Admin-Chats
        allowNull: false
    },
    subjectNumber: { // Hier kannst du die OrderNumber oder ProductNumber speichern
        type: DataTypes.STRING,
        allowNull: true
    },
    lastMessage: { // Optional: Für die Vorschau in der Chat-Liste
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'chats',
    timestamps: true,
    indexes: [
        { fields: ['participant1Id'] },
        { fields: ['participant2Id'] },
        { fields: ['orderId'] }
    ]
});

module.exports = Chat;