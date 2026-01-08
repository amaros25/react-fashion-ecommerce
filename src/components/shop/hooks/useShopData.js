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
        const fetchData = async () => {
            if (!sellerId) {
                setError('no_seller_id');
                toast.error(t('no_seller_id'));
                return;
            }

            setLoading(true);
            try {
                // 1. Fetch Seller (by ID or Slug)
                const sellerRes = await fetch(`${apiUrl}/sellers/${sellerId}`);
                if (!sellerRes.ok) throw new Error("fetch_seller_failed");
                const sellerData = await sellerRes.json();
                setSeller(sellerData);

                // 2. Fetch Products using the resolved Seller ID
                // Verify we have an ID
                if (!sellerData._id) throw new Error("fetch_products_failed"); // Should not happen if sellerRes ok

                const productsRes = await fetch(`${apiUrl}/products/seller/${sellerData._id}?page=${page}&limit=12`);
                if (!productsRes.ok) throw new Error("fetch_products_failed");
                const productsData = await productsRes.json();

                if (Array.isArray(productsData.products)) {
                    setProducts(productsData.products);
                    setTotalPages(productsData.totalPages || 0);
                    setTotalItems(productsData.totalCount || 0);
                } else {
                    setProducts([]);
                    setTotalItems(0);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching shop data:', err);
                setError(err.message || 'fetch_shop_data_failed');
                toast.error(t(err.message || 'fetch_shop_data_failed'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

