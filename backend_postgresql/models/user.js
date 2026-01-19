const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'seller', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    },
    active: {
        type: DataTypes.ENUM('pending', 'active', 'banned', 'deleted', 'verified', 'unverified'),
        allowNull: false,
        defaultValue: 'pending'
    },
    shopName: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subCity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
},
    {
        tableName: 'users',
        timestamps: true,
        indexes: [
            { unique: true, fields: ['email'] },
            { unique: true, fields: ['phone'] },
            { unique: true, fields: ['shopName'] },
            { fields: ['role', 'active'] }
        ]
    });

User.afterCreate(async (user, options) => {
    const { UserStats } = sequelize.models;

    try {
        await UserStats.create({
            userId: user.id,
            orderCount: 0,
            openOrders: 0,
            reviewCount: 0,
            avgRating: 0,
            productCount: 0,
            unreadMessages: 0
        }, { transaction: options.transaction });
    } catch (error) {
        console.error("UserStats creation failed:", error);
        throw error;
    }
});

module.exports = User;
