import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export const useShopData = (sellerId, userId) => {
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;

    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);

    // Fetch Seller Info
    useEffect(() => {
        const fetchSeller = async () => {
            try {
                const res = await fetch(`${apiUrl}/sellers/${sellerId}`);
                if (!res.ok) throw new Error('Failed to fetch seller');
                const data = await res.json();
                setSeller(data);

                // Check if current user has already rated
                if (userId && data.reviews && Array.isArray(data.reviews)) {
                    const userReview = data.reviews.find(r => r.userId === userId);
                    if (userReview) {
                        setHasRated(true);
                        setUserRating(userReview.rating);
                    }
                }
            } catch (error) {
                console.error('Error fetching seller:', error);
                toast.error('Could not load shop information');
            }
        };

        if (sellerId) {
            fetchSeller();
        }
    }, [sellerId, apiUrl, userId]);

    // Fetch Seller Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/products/latest?seller=${sellerId}&page=${page}&limit=12`);
                const data = await res.json();

                if (Array.isArray(data.products)) {
                    // Filter client side just in case
                    const sellerProducts = data.products.filter(p => p.sellerId === sellerId);
                    setProducts(data.products);
                    setTotalPages(data.totalPages);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) {
            fetchProducts();
        }
    }, [sellerId, page, apiUrl]);

    const handleRateSeller = async (ratingValue) => {
        if (hasRated) return;
        if (!userId) {
            toast.info(t('Please login to rate this seller'));
            return;
        }

        // Optimistic update
        setUserRating(ratingValue);
        setHasRated(true);

        try {
            const res = await fetch(`${apiUrl}/sellers/${sellerId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    rating: ratingValue
                })
            });

            if (!res.ok) {
                throw new Error('Failed to submit rating');
            }

            // Update seller local state to reflect new average immediately
            if (seller) {
                const newReview = { userId: userId, rating: ratingValue };
                const updatedReviews = [...(seller.reviews || []), newReview];
                setSeller({ ...seller, reviews: updatedReviews });
            }

            toast.success(t('Thank you for your rating!'));

        } catch (error) {
            console.error("Error rating seller:", error);
            toast.error(t('Failed to submit rating'));
            // Revert optimistic update
            setHasRated(false);
            setUserRating(0);
        }
    };

    return {
        seller,
        products,
        loading,
        page,
        setPage,
        totalPages,
        userRating,
        hasRated,
        handleRateSeller
    };
};
