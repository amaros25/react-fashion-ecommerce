const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const OrderStatusHistory = require('./order_status_history');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    orderNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    currentStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    paymentInfo: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    is_delivery: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    buyerSnapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
        beforeValidate: async (order) => {
            if (!order.orderNumber) {
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let isUnique = false;
                let attempts = 0;

                while (!isUnique && attempts < 10) {
                    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
                    const min = 100;
                    const max = 999999;
                    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                    const candidateNumber = `OR-${randomLetter}${randomNum}`;
                    const existingOrder = await order.constructor.findOne({
                        where: { orderNumber: candidateNumber },
                        attributes: ['id']
                    });
                    if (!existingOrder) {
                        order.orderNumber = candidateNumber;
                        isUnique = true;
                    } else {
                        attempts++;
                    }
                }
                if (!isUnique) {
                    throw new Error("unique order number could not be generated");
                }
            }
        },
        // AUTOMATISIERUNG: Erstellt den ersten History-Eintrag nach dem Erstellen der Order
        afterCreate: async (order, options) => {
            await OrderStatusHistory.create({
                orderId: order.id,
                status: order.currentStatus
            }, { transaction: options.transaction });
        }
    },
    indexes: [
        { fields: ['userId'] },
        { fields: ['sellerId'] },
        { fields: ['orderNumber'] },
        { fields: ['currentStatus'] }
    ]
});


module.exports = Order;
