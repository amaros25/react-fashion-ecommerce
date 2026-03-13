const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');


/*const SellerBill = sequelize.define('SellerBill', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    billNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },

}, {
    tableName: 'seller_bills',
    timestamps: true,
    hooks: {
        beforeValidate: async (bill) => {
            if (!bill.billNumber) {
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let isUnique = false;
                let attempts = 0;
                while (!isUnique && attempts < 10) {
                    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
                    const randomNum = Math.floor(Math.random() * 900000) + 100000;
                    const candidateNumber = `FACT-${randomLetter}${randomNum}`;
                    const existingBill = await bill.constructor.findOne({
                        where: { billNumber: candidateNumber },
                        attributes: ['id']
                    });
                    if (!existingBill) {
                        bill.billNumber = candidateNumber;
                        isUnique = true;
                    } else {
                        attempts++;
                    }
                }
            }
        }
    },
    indexes: [
        { fields: ['orderId'] },
        { fields: ['sellerId'] },
        { fields: ['billNumber'], unique: true },
        { fields: ['isPaid'] }
    ]
});

module.exports = SellerBill; */