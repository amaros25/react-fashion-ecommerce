import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as rateSellerProductApi from '../api/rate_seller_product_api';

/**
 * Specialized hook for submitting order ratings.
 * English comments as requested.
 */
export const useSubmitRating = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ order, token, sellerRating, productRatings }) =>
            rateSellerProductApi.rate_seller_product({ order, userId, token, sellerRating, productRatings }),

        onSuccess: () => {
            // Invalidate order related queries to show the updated "rated" status
            queryClient.invalidateQueries({ queryKey: ['orders', userId] });
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        }
    });
};