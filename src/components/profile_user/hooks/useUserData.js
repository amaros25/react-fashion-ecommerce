import { useState, useCallback } from 'react';

/**
 * Custom hook for managing user data
 * @param {string} apiUrl - API base URL
 * @param {string} userId - User ID
 * @param {string} token - Authentication token
 * @returns {Object} - User data, loading state, error, and update function
 */
export const useUserData = (apiUrl, userId, token) => {
    console.log("useUserData apiUrl: ", apiUrl);
    console.log("useUserData userId: ", userId);
    console.log("useUserData token: ", token);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUser = useCallback(async () => {
        if (!userId || !token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${apiUrl}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch user: ${res.status}`);
            }

            const data = await res.json();
            setUser(data);
        } catch (err) {
            console.error('Error fetching user:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, userId, token]);

    const updateUser = useCallback(async (updates) => {
        if (!userId || !token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${apiUrl}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                throw new Error(`Failed to update user: ${res.status}`);
            }

            const data = await res.json();
            setUser(data);
            return data;
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiUrl, userId, token]);

    return {
        user,
        loading,
        error,
        fetchUser,
        updateUser,
    };
};
