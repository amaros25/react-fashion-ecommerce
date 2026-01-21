const { Sequelize } = require('sequelize');

require('dotenv').config({ path: './backend_postgresql/.env' });  // Pfad zur .env-Datei im backend_postgresql Verzeichnis


console.log('Working directory:', process.cwd());
require('dotenv').config();  // Lädt die .env-Datei
console.log('User:', process.env.PG_USER);
console.log('Password:', process.env.PG_PASSWORD);
console.log('DB:', process.env.PG_DATABASE);

const sequelize = new Sequelize(


    process.env.PG_DATABASE || 'mein_backend_db',
    process.env.PG_USER || 'admin_shop',
    process.env.PG_PASSWORD || 'etun#web!?9iuB',
    {
        host: 'db',
        dialect: 'postgres',
        logging: false, // Set to console.log to see SQL queries
        port: process.env.PG_PORT || 5432,
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
        console.log('PostgreSQL / Sequelize connection has been established successfully.');

        // Sync models
        // In production, use migrations instead of { alter: true }
        // await sequelize.sync({ alter: true });
    } catch (error) {
        console.error('Unable to connect to the PostgreSQL database:', error);
        process.exit(1);
    }
};
connectDB();
module.exports = { sequelize, connectDB };
