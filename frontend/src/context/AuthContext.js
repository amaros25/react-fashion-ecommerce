import React, { createContext, useState, useEffect, useContext } from 'react';
import { socket } from './socket';
import { useQueryClient } from '@tanstack/react-query';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (token && userId && socket) {
            if (!socket.connected) socket.connect();
            socket.emit('join_private_room', userId);

            // Clean up listener if it was attached elsewhere, but here we only manage connection
            return () => {
                // socket.off('stats_update', handleStatsUpdate);
            };
        }
    }, [token, userId]);

    useEffect(() => {
        if (token && userId) {
            const savedData = localStorage.getItem('userData');
            if (savedData) {
                setUser(JSON.parse(savedData));
            }
        }
        setLoading(false);
    }, [token, userId]);

    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data.userId);
        if (data.userData) {
            localStorage.setItem('userData', JSON.stringify(data.userData));
            setUser(data.userData);
        }
        setToken(data.token);
        setRole(data.role);
        setUserId(data.userId);
    };

    const logout = () => {
        if (socket) socket.disconnect();
        localStorage.clear();
        setToken(null);
        setRole(null);
        setUserId(null);
        setUser(null);
    };

    const value = {
        token,
        role,
        userId,
        user,
        isLoggedIn: !!token,
        login,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>
        {children}

    </AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
