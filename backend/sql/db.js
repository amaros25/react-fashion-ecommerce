const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './backend/.env' });

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'fashion_ecommerce',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
        host: process.env.MYSQL_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL / Sequelize connection has been established successfully.');

        // Sync models
        // In production, use migrations instead of { alter: true }
        // await sequelize.sync({ alter: true });
    } catch (error) {
        console.error('Unable to connect to the MySQL database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
