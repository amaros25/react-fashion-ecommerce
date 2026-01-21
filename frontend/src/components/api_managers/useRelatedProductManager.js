// api_managers/useRelatedProductManager.js
import { useLatestProductsQuery } from '../api_hooks/product_hooks';
import { useMemo } from 'react';

export const useRelatedProductManager = (category, currentProductId) => {
    const params = {
        page: 1,
        limit: 12,
        category: category,
        not: currentProductId
    };

    const isCategoryReady = category !== undefined && category !== null;
    const { data, isLoading, isError } = useLatestProductsQuery({
        ...params,
        enabled: isCategoryReady
    });

    const relatedProducts = useMemo(() => {
        const products = data?.products || [];
        return products.filter(p => String(p._id || p.id) !== String(currentProductId));
    }, [data, currentProductId]);

    return {
        relatedProducts,
        isLoading: isCategoryReady && isLoading,
        isError,
        hasData: relatedProducts.length > 0
    };
};