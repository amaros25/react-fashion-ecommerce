const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const UserProfileHistory = sequelize.define('UserProfileHistory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
        type: DataTypes.INTEGER, allowNull: false, index: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
    },
    changeType: {
        type: DataTypes.ENUM('address', 'phone', 'image', 'shopName', 'all', 'initial', 'status'),
        allowNull: false
    },
    newData: { type: DataTypes.JSONB, allowNull: false }
}, {
    tableName: 'user_profile_history', timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['userId'] }
    ]
});

module.exports = UserProfileHistory;