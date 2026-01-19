const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'order_status_history',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
        { fields: ['orderId'] },
        { fields: ['status'] }
    ]
});

module.exports = OrderStatusHistory;