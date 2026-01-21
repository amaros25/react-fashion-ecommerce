const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./db');
const sqlRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.originalUrl}`);
    next();
});

// Root Route für den Browser-Test
app.get('/', (req, res) => {
    res.send('Backend läuft perfekt auf Port 5000!');
});

// Main SQL API entry point
app.use('/api/', sqlRoutes);

const PORT = process.env.PORT_SQL || 5000;

const startServer = async () => {
    try {
        console.log('Versuche Datenbank zu verbinden...');
        await connectDB();

        await sequelize.sync({ alter: true });
        console.log('SQL Database synced');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Backend läuft definitiv auf Port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start SQL server:', error);
    }
};

// WICHTIG: Sofort starten!
startServer();

// Exports immer ganz ans Ende
module.exports = { app, sequelize, connectDB };