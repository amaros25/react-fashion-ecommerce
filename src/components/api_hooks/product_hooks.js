import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product_api';

/**
 * Hook to fetch latest products using TanStack Query.
 * @param {object} params - Query parameters.
 */
export const useLatestProductsQuery = (params) => {
    return useQuery({
        queryKey: ['latestProducts', params],
        queryFn: () => productApi.getLatestProducts(params),
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};
