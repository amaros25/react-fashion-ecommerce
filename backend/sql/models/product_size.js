const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const ProductSize = sequelize.define('ProductSize', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    size: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'product_sizes',
    timestamps: false
});

module.exports = ProductSize;
