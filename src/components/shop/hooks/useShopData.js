import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export const useShopData = (sellerId) => {
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSeller = async () => {
            try {
                const res = await fetch(`${apiUrl}/sellers/${sellerId}`);
                if (!res.ok) throw new Error("fetch_seller_failed");
                const data = await res.json();
                setSeller(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching seller:', err);
                setError(err.message || 'fetch_seller_failed');
                toast.error(t(err.message || 'fetch_seller_failed'));
            }
        };
        if (sellerId) {
            fetchSeller();
        } else {
            setError('no_seller_id');
            toast.error(t('no_seller_id'));
        }
    }, [sellerId, apiUrl, t]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/products/seller/${sellerId}?page=${page}&limit=12`);
                if (!res.ok) throw new Error("fetch_products_failed");
                const data = await res.json();
                if (Array.isArray(data.products)) {
                    setProducts(data.products);
                    setTotalPages(data.totalPages || 0);
                    setTotalItems(data.totalCount || 0);
                } else {
                    setProducts([]);
                    setTotalItems(0);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message || 'fetch_products_failed');
                toast.error(t(err.message || 'fetch_products_failed'));
            } finally {
                setLoading(false);
            }
        };
        if (sellerId) {
            fetchProducts();
        } else {
            setError('no_seller_id');
            toast.error(t('no_seller_id'));
        }
    }, [sellerId, page, apiUrl, t]);

    return {
        seller,
        products,
        loading,
        page,
        setPage,
        totalPages,
        totalItems,
        error
    };
};

