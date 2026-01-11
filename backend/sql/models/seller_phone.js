const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const SellerPhone = sequelize.define('SellerPhone', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sellerId: {
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
    tableName: 'seller_phones',
    timestamps: false
});

module.exports = SellerPhone;
