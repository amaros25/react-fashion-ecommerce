const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Section = sequelize.define('Section', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    tableName: 'sections',
    timestamps: true
});

module.exports = Section;
