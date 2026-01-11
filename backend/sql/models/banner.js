const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Banner = sequelize.define('Banner', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sectionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    linkUrl: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'banners',
    timestamps: false
});

module.exports = Banner;
