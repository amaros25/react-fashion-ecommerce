require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const productRoutes = require('./routes/products_route');
const sectionsRoutes = require('./routes/sections_route');
const authRoutes = require("./routes/auth_route");
const sellerRoutes = require("./routes/sellers_route");
const userRoutes = require("./routes/user_route");
const uploadRoutes = require('./routes/upload_route');
const orderRoutes = require('./routes/orders_route');
const chatRoutes = require('./routes/chat_route');

const path = require('path');

const app = express();
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware
app.use(express.json());
app.use(cors());

connectDB();

// Routen
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/sections', sectionsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chats', chatRoutes);
console.log("CORS enabled");
app.use(
  cors({

    origin: ["http://localhost:3000", "http://localhost:5173"], // React-Dev-Server-Ports
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
