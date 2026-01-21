import { useQuery } from '@tanstack/react-query';
import * as cartApi from '../api/cart_api';

/**
 * Hook to fetch multiple sellers by their IDs.
 * Used in the Cart page to display shop names.
 */
export const useSellersByIds = (sellerIds, token) => {
    return useQuery({
        queryKey: ['sellers', sellerIds],
        queryFn: () => cartApi.fetchSellersByIds(sellerIds, token),
        enabled: !!sellerIds && sellerIds.length > 0 && !!token,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to fetch a single public seller profile.
 */
export const usePublicSeller = (sellerId, token) => {
    return useQuery({
        queryKey: ['seller', sellerId],
        queryFn: () => cartApi.fetchPublicSeller(sellerId, token),
        enabled: !!sellerId && !!token,
        staleTime: 1000 * 60 * 5,
    });
};
