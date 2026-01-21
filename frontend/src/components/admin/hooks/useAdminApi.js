import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const useAdminApi = (apiUrl) => {
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                return { success: true, data };
            } else {
                return { success: false, errorKey: data.message || 'server_error' };
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
            return { success: false, errorKey: 'server_error' };
        }
    }, [apiUrl, token]);

    const fetchTabData = useCallback(async (tab) => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/admin/${tab}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                return { success: true, data };
            } else {
                return { success: false, errorKey: data.message || 'server_error' };
            }
        } catch (err) {
            console.error(`Error fetching ${tab}:`, err);
            return { success: false, errorKey: 'server_error' };
        } finally {
            setLoading(false);
        }
    }, [apiUrl, token]);

    const toggleActivation = useCallback(async (type, id, status) => {
        try {
            const endpoint = type === 'user' ? 'toggle-user' : 'toggle-seller';
            const res = await fetch(`${apiUrl}/admin/${endpoint}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ active: status })
            });

            const data = await res.json();
            if (res.ok) {
                return { success: true, active: data.active };
            } else {
                return { success: false, errorKey: data.message || 'server_error' };
            }
        } catch (err) {
            console.error("Error toggling activation:", err);
            return { success: false, errorKey: 'server_error' };
        }
    }, [apiUrl, token]);

    const updateProductStatus = useCallback(async (id, status) => {
        try {
            const res = await fetch(`${apiUrl}/admin/product-status/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await res.json();
            if (res.ok) {
                return { success: true, status: data.status };
            } else {
                return { success: false, errorKey: data.message || 'server_error' };
            }
        } catch (err) {
            console.error("Error updating product status:", err);
            return { success: false, errorKey: 'server_error' };
        }
    }, [apiUrl, token]);

    const updateOrderStatus = useCallback(async (id, status) => {
        try {
            const res = await fetch(`${apiUrl}/admin/order-status/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await res.json();
            if (res.ok) {
                return { success: true, status: data.status };
            } else {
                return { success: false, errorKey: data.message || 'server_error' };
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            return { success: false, errorKey: 'server_error' };
        }
    }, [apiUrl, token]);

    return {
        loading,
        fetchStats,
        fetchTabData,
        toggleActivation,
        updateProductStatus,
        updateOrderStatus
    };
};
