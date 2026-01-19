const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const UserReview = sequelize.define('UserReview', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE'
    },

    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'user_reviews',
    timestamps: true,
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['senderId', 'orderId']
        },
        { fields: ['receiverId'] },
    ]
});

module.exports = UserReview;