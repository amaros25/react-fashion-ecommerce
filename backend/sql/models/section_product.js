const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

// Junction table for Section-Product relationships
const SectionProduct = sequelize.define('SectionProduct', {
    sectionId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'sections',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('offer', 'bestOrder', 'popularCategory'),
        allowNull: false
    }
}, {
    tableName: 'section_products',
    timestamps: false
});

module.exports = SectionProduct;
