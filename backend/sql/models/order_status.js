const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const OrderStatus = sequelize.define('OrderStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    update: {
        type: DataTypes.INTEGER, // Status code
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'order_statuses',
    timestamps: false
});

module.exports = OrderStatus;
