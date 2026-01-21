
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const UserStats = sequelize.define('UserStats', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    orderCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    openOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
    reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    avgRating: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0 },
    productCount: { type: DataTypes.INTEGER, defaultValue: 0 }, // Nur für Seller relevant
    unreadMessages: { type: DataTypes.INTEGER, defaultValue: 0 },
    views: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'user_stats', timestamps: false });

module.exports = UserStats;