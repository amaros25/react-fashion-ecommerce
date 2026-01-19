const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./db');
const sqlRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.originalUrl}`);
    next(); // Wir rufen `next()` auf, um die Anfrage an die nächste Middleware oder Route weiterzuleiten
});


// Main SQL API entry point
app.use('/api/', sqlRoutes);

const PORT = process.env.PORT_SQL || 5001;

const startServer = async () => {
    try {
        await connectDB();

        // Sync database (caution: { alter: true } matches models to DB)
        // For first run, you might want this to create tables.
        await sequelize.sync({ force: false }); // Change to force: true to drop and recreate
        console.log('SQL Database synced');

        app.listen(PORT, () => {
            console.log(`MySQL Backend running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start SQL server:', error);
    }
};

startServer();
