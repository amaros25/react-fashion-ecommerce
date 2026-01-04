import { useState, useCallback } from 'react';

export const useAdminApi = (apiUrl) => {
    const [loading, setLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/admin/stats`);
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
    }, [apiUrl]);

    const fetchTabData = useCallback(async (tab) => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/admin/${tab}`);
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
    }, [apiUrl]);

    const toggleActivation = useCallback(async (type, id, currentStatus) => {
        try {
            const endpoint = type === 'user' ? 'toggle-user' : 'toggle-seller';
            const res = await fetch(`${apiUrl}/admin/${endpoint}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ active: !currentStatus })
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
    }, [apiUrl]);

    return {
        loading,
        fetchStats,
        fetchTabData,
        toggleActivation
    };
};
