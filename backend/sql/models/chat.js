const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('order', 'product'),
        allowNull: false
    },
    number: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'chats',
    timestamps: true
});

module.exports = Chat;
