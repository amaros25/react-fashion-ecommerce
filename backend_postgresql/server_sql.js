console.log("************************* Server Start ***************************");
require('dotenv').config({ path: './.env' });
console.log("JWT_SECRET check:", process.env.JWT_SECRET);
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB, sequelize } = require('./db');
const sqlRoutes = require('./routes/api');
const initDbListener = require('./services/dbListener');



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
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Im Production-Betrieb später anpassen!
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    socket.on('join_private_room', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`📡 Socket: User ${userId} ist seinem Raum beigetreten.`);
        }
    });

    socket.on('disconnect', () => {
        console.log('📡 Socket: Client getrennt');
    });
});

const startServer = async () => {
    try {
        console.log('Versuche Datenbank zu verbinden...');
        await connectDB();

        // Synchronisation (Vorsicht mit alter:true in Production)
        await sequelize.sync({ alter: true });
        console.log('✅ SQL Database synced');

        // Initialisiere den Postgres Listener und übergebe io
        await initDbListener(io);
        console.log('✅ Postgres Listener aktiv');

        // WICHTIG: server.listen nutzen, NICHT app.listen
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Backend & Sockets laufen auf Port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
};
// WICHTIG: Sofort starten!
startServer();



// Exports immer ganz ans Ende
module.exports = { app, sequelize, connectDB };



// DROP TRIGGER IF EXISTS trg_order_status_update ON orders;
//CREATE TRIGGER trg_order_status_update
// AFTER UPDATE OF "currentStatus" ON orders
// FOR EACH ROW
// WHEN (OLD."currentStatus" IS DISTINCT FROM NEW."currentStatus")
// EXECUTE FUNCTION notify_order_status_update()