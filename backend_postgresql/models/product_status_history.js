const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const ProductStatusHistory = sequelize.define('ProductStatusHistory', {
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
    state: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'product_status_history',
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['productId'] },
        { fields: ['state'] },
        { fields: ['createdAt'] },
        { fields: ['productId', 'createdAt'] }
    ]
});

module.exports = ProductStatusHistory;