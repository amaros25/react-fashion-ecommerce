import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SellerRoute = ({ children }) => {
    const { isLoggedIn, role, loading } = useAuth();

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (role !== 'seller') {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default SellerRoute;
