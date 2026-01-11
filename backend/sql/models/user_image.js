const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const UserImage = sequelize.define('UserImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
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
    tableName: 'user_images',
    timestamps: false
});

module.exports = UserImage;
