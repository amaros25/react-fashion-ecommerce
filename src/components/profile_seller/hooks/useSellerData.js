import { useState, useCallback } from 'react';

/**
 * Custom hook for managing seller data
 * @param {string} apiUrl - API base URL
 * @param {string} userId - Seller user ID
 * @param {string} token - Authentication token
 * @returns {Object} - Seller data, loading state, error, and update function
 */
export const useSellerData = (apiUrl, userId, token) => {
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSeller = useCallback(async () => {
        if (!userId || !token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${apiUrl}/sellers/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch seller: ${res.status}`);
            }

            const data = await res.json();
            setSeller(data);
        } catch (err) {
            console.error('Error fetching seller:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, userId, token]);

    const updateSeller = useCallback(async (updates) => {
        if (!userId || !token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${apiUrl}/sellers/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                throw new Error(`Failed to update seller: ${res.status}`);
            }

            const data = await res.json();
            setSeller(data);
            return data;
        } catch (err) {
            console.error('Error updating seller:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiUrl, userId, token]);

    return {
        seller,
        loading,
        error,
        fetchSeller,
        updateSeller,
    };
};
