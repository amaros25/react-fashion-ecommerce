// api_hooks/product_hooks.js
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product_api';

export const useLatestProductsQuery = (params) => {
    const { enabled, ...apiParams } = params;
    return useQuery({
        queryKey: ['latestProducts', params],
        queryFn: () => productApi.getLatestProducts(apiParams),
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60 * 5, // 5 Minuten "frisch"
        enabled: enabled !== false
    });
};