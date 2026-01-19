const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const UserAuth = sequelize.define('UserAuth', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true, // 1:1 Beziehung, daher userId als PK möglich
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
    },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'user_auth',
    timestamps: false
});

module.exports = UserAuth;