import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/product_api';

// Hook to fetch products with caching
export const useSellerProducts = (sellerId, params, token) => {
    return useQuery({
        queryKey: ['seller-products', sellerId, params],
        queryFn: () => productApi.getSellerProducts(sellerId, params, token),
        enabled: !!sellerId,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};

// Hook to create a product
export const useCreateProduct = (token) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productData) => productApi.createProduct(productData, token),
        onSuccess: (newProduct) => {
            // This tells React Query: "The list is old, fetch it again"
            // It will sync all components using the 'seller-products' key
            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
            console.log("Product created and cache invalidated:", newProduct);
        },
    });
};