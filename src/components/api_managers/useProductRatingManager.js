import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useRateProduct } from '../api_hooks/rating_hooks';

/**
 * Manager for single product rating logic.
 * Handles state for one product and interacts with the specific product hook.
 */
export const useProductRatingManager = (productId, userId, token, onRatingComplete) => {
    const { t } = useTranslation();

    // 1. Local UI State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    // 2. Mutation Hook (using the one we created earlier)
    const { mutate: submitRating, isPending } = useRateProduct(userId);

    /**
     * Handles the submission for a single product
     */
    const handleSubmit = () => {
        // Validation
        if (rating === 0) {
            toast.error(t("please_select_rating"));
            return;
        }

        submitRating({
            productId,
            userId,
            rating,
            comment,
            token
        }, {
            onSuccess: () => {
                toast.success(t("rating_submitted_success"));
                if (onRatingComplete) onRatingComplete();
            },
            onError: (error) => {
                const message = error.message; // From rating_api.js throw
                if (message === "already_rated") {
                    toast.error(t("product_already_rated_msg"));
                } else {
                    toast.error(t("failed_to_submit_rating"));
                }
            }
        });
    };

    return {
        rating,
        setRating,
        comment,
        setComment,
        isSubmitting: isPending,
        submitRating: handleSubmit
    };
};