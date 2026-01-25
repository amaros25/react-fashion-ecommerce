import { io } from 'socket.io-client';
const URL = 'http://localhost:5000';

export const socket = io(URL, {
    autoConnect: true,
    reconnection: true,
    transports: ['websocket', 'polling'] // Erhöht die Kompatibilität
    // Falls du JWT nutzt, kannst du den Token hier mitschicken:
    // auth: { token: localStorage.getItem('token') }
});

// Debugging direkt in der socket.js
socket.on('connect', () => console.log("✅ Socket verbunden mit ID:", socket.id));
socket.on('connect_error', (err) => console.error("❌ Socket Connect Error:", err));