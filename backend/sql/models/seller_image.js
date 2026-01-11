const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const SellerImage = sequelize.define('SellerImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateModified: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'seller_images',
    timestamps: false
});

module.exports = SellerImage;
