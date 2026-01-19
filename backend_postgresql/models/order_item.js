const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'RESTRICT'
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'RESTRICT'
    },
    variantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'product_variants', key: 'id' },
        onDelete: 'RESTRICT'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    priceAtPurchase: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['orderId'] },
        { fields: ['productId'] },
        { fields: ['variantId'] }
    ]
});


module.exports = OrderItem;