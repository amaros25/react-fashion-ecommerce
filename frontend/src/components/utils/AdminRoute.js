import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { isLoggedIn, role, loading } = useAuth();

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (!isLoggedIn || role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;
