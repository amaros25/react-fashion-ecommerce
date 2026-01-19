import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as ratingHooks from '../api_hooks/rate_seller_product_hook';

/**
 * Manager to handle UI state and submission for order ratings.
 */
export const useOrderRatingManager = (order, userId, token, onRatingComplete) => {
    const { t } = useTranslation();

    // 1. LOCAL STATE: Stars and Comments
    const [sellerRating, setSellerRating] = useState(0);
    const [productRatings, setProductRatings] = useState(
        order.items.reduce((acc, item) => ({
            ...acc,
            [item.productId]: { rating: 0, comment: "" }
        }), {})
    );

    // 2. MUTATION HOOK
    const ratingMutation = ratingHooks.useSubmitRating(userId);

    /**
     * Updates the local state for a specific product
     */
    const handleProductRatingChange = (productId, field, value) => {
        setProductRatings(prev => ({
            ...prev,
            [productId]: { ...prev[productId], [field]: value }
        }));
    };

    /**
     * Validates and submits the rating to the backend
     */
    const handleSubmit = async () => {
        // Validation
        if (sellerRating === 0) {
            toast.error(t("please_rate_seller"));
            return;
        }

        const missingProductRating = Object.values(productRatings).some(p => p.rating === 0);
        if (missingProductRating) {
            toast.error(t("please_rate_all_products"));
            return;
        }

        try {
            // Execute the single combined request
            await ratingMutation.mutateAsync({
                order,
                token,
                sellerRating,
                productRatings
            });

            toast.success(t("thank_you_for_rating"));
            if (onRatingComplete) onRatingComplete();
        } catch (error) {
            const message = error.response?.data?.message;
            if (message === "review_already_exists" || message === "order_already_rated") {
                toast.error(t("review_already_exists_msg"));
            } else {
                toast.error(t("failed_to_submit_ratings"));
            }
        }
    };

    return {
        // State
        sellerRating,
        setSellerRating,
        productRatings,

        // Status
        isSubmitting: ratingMutation.isPending,
        error: ratingMutation.error,

        // Actions
        handleProductRatingChange,
        submitRatings: handleSubmit
    };
};