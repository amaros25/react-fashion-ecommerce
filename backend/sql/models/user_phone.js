const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const UserPhone = sequelize.define('UserPhone', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateModified: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_phones',
    timestamps: false
});

module.exports = UserPhone;
