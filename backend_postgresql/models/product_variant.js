const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE'
    },
    size: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: false },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 }
    }
}, {
    tableName: 'product_variants',
    timestamps: true,
    indexes: [
        { fields: ['productId'] },
        { fields: ['size'] },
        { fields: ['color'] }
    ]
});

module.exports = ProductVariant;