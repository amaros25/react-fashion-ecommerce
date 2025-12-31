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
            [item.productId]: { rating: 0, comment: '' }
        }), {})
    );
    const [submitting, setSubmitting] = useState(false);

    const handleProductRatingChange = (productId, field, value) => {
        setProductRatings(prev => ({
            ...prev,
            [productId]: { ...prev[productId], [field]: value }
        }));
    };

    const submitRatings = async () => {
        if (sellerRating === 0) {
            toast.error(t("please_rate_seller") || "Please rate the seller");
            return;
        }

        const missingProductRating = Object.values(productRatings).some(p => p.rating === 0);
        if (missingProductRating) {
            toast.error(t("please_rate_all_products") || "Please rate all products");
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
            for (const item of order.items) {
                const { rating, comment } = productRatings[item.productId];
                const prodRes = await fetch(`${apiUrl}/products/${item.productId}/rate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, rating, comment })
                });
                if (!prodRes.ok) console.error(`Failed to rate product ${item.productId}`);
            }

            toast.success(t("thank_you_for_rating") || "Thank you for your rating!");
            if (onRatingComplete) onRatingComplete();
        } catch (err) {
            console.error(err);
            toast.error(t("failed_to_submit_ratings") || "Failed to submit ratings");
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
        submitting
    };
};
