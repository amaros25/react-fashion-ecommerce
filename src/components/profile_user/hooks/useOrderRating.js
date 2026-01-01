import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export const useOrderRating = (order, onRatingComplete) => {
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;
    const userId = localStorage.getItem("userId");

    const [sellerRating, setSellerRating] = useState(0);
    const [productRatings, setProductRatings] = useState(
        order.items.reduce((acc, item) => ({
            ...acc,
            [item.productId]: { rating: 0 }
        }), {})
    );
    const [orderComment, setOrderComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleProductRatingChange = (productId, field, value) => {
        // field is always 'rating' now as comments are global
        if (field === 'rating') {
            setProductRatings(prev => ({
                ...prev,
                [productId]: { ...prev[productId], rating: value }
            }));
        }
    };

    const submitRatings = async () => {
        if (sellerRating === 0) {
            toast.error(t("please_rate_seller"));
            return;
        }

        const missingProductRating = Object.values(productRatings).some(p => p.rating === 0);
        if (missingProductRating) {
            toast.error(t("please_rate_all_products"));
            return;
        }

        setSubmitting(true);
        try {
            // 1. Submit Seller Rating
            const sellerRes = await fetch(`${apiUrl}/sellers/${order.sellerId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    orderId: order._id,
                    productId: order.items[0]?.productId, // representative product
                    rating: sellerRating
                })
            });

            if (!sellerRes.ok) throw new Error("Failed to rate seller");

            // 2. Submit Product Ratings
            // We use the same orderComment for all products, or just the first one?
            // Usually duplicate content is fine, or we append it only to the first.
            // Let's send it with all for now to ensure visibility.
            for (const item of order.items) {
                const { rating } = productRatings[item.productId];
                const prodRes = await fetch(`${apiUrl}/products/${item.productId}/rate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, rating, comment: orderComment })
                });
                if (!prodRes.ok) console.error(`Failed to rate product ${item.productId}`);
            }

            toast.success(t("thank_you_for_rating"));
            if (onRatingComplete) onRatingComplete();
        } catch (err) {
            console.error(err);
            toast.error(t("failed_to_submit_ratings"));
        } finally {
            setSubmitting(false);
        }
    };

    return {
        sellerRating,
        setSellerRating,
        productRatings,
        handleProductRatingChange,
        submitRatings,
        submitting,
        orderComment,
        setOrderComment
    };
};
