import { useState } from 'react';
import { useSellerProducts } from '../api_hooks/seller_products_hook';

export const useSellerProductFetchManager = (sellerId, token) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading, error } = useSellerProducts(sellerId, {
        page,
        search,
        limit: 15
    }, token);

    return {
        products: data?.products || [],
        totalPages: data?.totalPages || 0,
        isLoading,
        error,
        currentPage: page,
        search,
        handleSearch: (term) => {
            setSearch(term);
            setPage(1); // Reset to first page on search
        },
        handlePageChange: (newPage) => setPage(newPage)
    };
};