const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const SellerAddress = sequelize.define('SellerAddress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subCity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dateModified: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'seller_addresses',
    timestamps: false
});

module.exports = SellerAddress;
