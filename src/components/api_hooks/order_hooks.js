import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderApi from '../api/order_api';



const shouldNotRetry = (failureCount, error) => {
    if (error.response?.status === 403 || error.response?.status === 400) {
        return false;
    }
    return failureCount < 1;
};

export const useOrders = (userId, token, page, limit) => {
    return useQuery({
        queryKey: ['orders', userId, page, limit],
        queryFn: () => orderApi.fetchUserOrders({ userId, token, page, limit }),
        enabled: !!userId && !!token,
        staleTime: 1000 * 60 * 5, // 5 Minuten Cache
        retry: shouldNotRetry,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useUpdateStatus = (userId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, newStatus, token, comment }) =>
            orderApi.updateOrderStatus({ orderId, newStatus, token, comment }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', userId] });
        },
    });
};


export const useSellerOrdersQuery = (sellerId, params, token) => {
    return useQuery({
        queryKey: ['seller-orders', sellerId, params],
        queryFn: () => orderApi.getSellerOrders(sellerId, params, token),
        enabled: !!sellerId && !!token,
        keepPreviousData: true, // Verhindert Flackern beim Seitenwechsel
        staleTime: 1000 * 60 * 2, // 2 Minuten
        retry: shouldNotRetry,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
};

export const useSellerUpdateOrderStatus = (token) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables) =>
            orderApi.updateOrderStatus({
                ...variables,
                newStatus: variables.status,
                token
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
        },
    });
};
