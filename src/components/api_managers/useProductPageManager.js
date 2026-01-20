import { useMemo } from 'react';
import { useProductDetailQuery } from '../api_hooks/product_detail_hook';

/**
 * Manager hook to orchestrate product data on the detail page.
 * It merges initial data (from Home) with additional details fetched from the API.
 * Note: Seller data is now expected to be included in the backend response.
 */
export const useProductPageManager = (productId, initialProduct) => {

    // 1. Fetch product data (triggers either 'remaining' or 'complete' logic)
    const {
        data: product,
        isLoading: productLoading,
        error: productApiError
    } = useProductDetailQuery(productId, initialProduct);

    const loading = !product && productLoading;
    return {
        product,
        // Since seller is included in the backend, we access it via product.seller
        seller: product?.seller || null,
        loading,
        error: productApiError?.response?.data?.error || productApiError?.message,

        isFullyLoaded: !!product?.variants,
        isInitial: !!initialProduct && !product?.variants,
        isError: !!productApiError
    };
};