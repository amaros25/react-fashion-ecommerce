import { useState, useCallback } from 'react';

/**
 * Custom hook for managing seller products
 * @param {string} apiUrl - API base URL
 * @param {string} sellerId - Seller ID
 * @param {string} token - Authentication token
 * @returns {Object} - Products data, loading state, error, and fetch function
 */
export const useSellerProducts = (apiUrl, sellerId, token) => {
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async (page = 1, limit = 12, search = '') => {
        if (!sellerId || !token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `${apiUrl}/products/seller/${sellerId}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) {
                throw new Error(`Failed to fetch products: ${res.status}`);
            }

            const data = await res.json();
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.page || 1);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, sellerId, token]);

    return {
        products,
        totalPages,
        currentPage,
        loading,
        error,
        fetchProducts,
    };
};
