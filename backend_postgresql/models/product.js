const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const ProductStatusHistory = require('./product_status_history');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false
    },
    delprice: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0 //free shipping
    },
    category: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subcategory: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    discountedPercent: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    images: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    avgRating: {
        type: DataTypes.DECIMAL(4, 2),
        defaultValue: 0
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    orderCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    currentState: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
}, {
    tableName: 'products',
    timestamps: true,
    hooks: {
        beforeValidate: async (product) => {
            if (!product.productNumber) {
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let isUnique = false;
                let attempts = 0;

                while (!isUnique && attempts < 10) {
                    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
                    const min = 100;
                    const max = 999999;
                    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                    const candidateNumber = `PR-${randomLetter}${randomNum}`;
                    const existingProduct = await product.constructor.findOne({
                        where: { productNumber: candidateNumber },
                        attributes: ['id']
                    });
                    if (!existingProduct) {
                        product.productNumber = candidateNumber;
                        isUnique = true;
                    } else {
                        attempts++;
                    }
                }

                if (!isUnique) {
                    throw new Error("unique product number could not be generated");
                }
            }
        },
        afterCreate: async (product, options) => {
            await ProductStatusHistory.create({
                productId: product.id,
                state: 0,
                comment: 'init'
            }, { transaction: options.transaction });
        }
    },
    indexes: [
        { fields: ['sellerId'] },
        { fields: ['category', 'subcategory'] },
        { fields: ['price'] },
        { fields: ['currentState'] },
        {
            name: 'idx_product_rating_sorting',
            fields: ['avgRating', 'createdAt']
        },
        {
            name: 'idx_product_number',
            fields: ['productNumber'],
            unique: true
        },
        {
            name: 'product_name_trgm_idx',
            using: 'gin',
            fields: [sequelize.literal('name gin_trgm_ops')]
        }
    ],
});

module.exports = Product;
