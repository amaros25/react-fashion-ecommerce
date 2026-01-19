import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ratingApi from '../api/rating_api';

/**
 * Hook for Seller Ratings
 */
export const useRateSeller = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables) => ratingApi.rateSeller(variables),
        onSuccess: () => {
            // Invalidate to refresh the "rated" status in order lists
            queryClient.invalidateQueries({ queryKey: ['orders', userId] });
        }
    });
};

/**
 * Hook for Individual Product Ratings
 */
export const useRateProduct = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (variables) => ratingApi.rateProduct(variables),
        onSuccess: () => {
            // Invalidate specific order or product data if needed
            queryClient.invalidateQueries({ queryKey: ['orders', userId] });
        }
    });
};