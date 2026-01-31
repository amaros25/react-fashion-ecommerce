import { useState, useEffect } from 'react';
import * as orderHooks from '../api_hooks/order_hooks';
import { useQueryClient } from '@tanstack/react-query';

export const useOrderManager = ({ role, id, token, initialLimit = 10 }) => {
    const queryClient = useQueryClient();

    // States für Pagination und Filter
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Dynamische Wahl des Hooks basierend auf der Rolle
    const isSeller = role === 'seller';

    // Query Parameter Objekt
    const queryParams = {
        page,
        limit: initialLimit,
        status: statusFilter,
        orderNumber: searchTerm
    };

    const getErrorMessage = (error) => {
        if (!error) return null;

        const errorForUI = ordersQuery.error?.response?.data?.message || ordersQuery.error?.message;
        return errorForUI;
    };

    // Hooks aufrufen (TanStack Query)
    const ordersQuery = isSeller
        ? orderHooks.useSellerOrdersQuery(id, queryParams, token)
        : orderHooks.useOrders(id, token, page, initialLimit); // User Hook ggf. anpassen falls er Filter braucht

    const statusMutation = isSeller
        ? orderHooks.useSellerUpdateOrderStatus(token)
        : orderHooks.useUpdateStatus(id);

    const data = ordersQuery.data || { orders: [], totalOrders: 0, products: {}, totalPages: 1 };

    /**
     * Zentralisierte Status-Update Logik mit Validierung
     */
    const handleUpdateStatus = async ({ orderId, newStatus, comment = "" }) => {
        // Cache Validierung
        const queryKey = isSeller
            ? ['sellerOrders', id, queryParams]
            : ['orders', id, page, initialLimit];

        const cachedData = queryClient.getQueryData(queryKey);
        const order = cachedData?.orders?.find(o => o.id === orderId);

        if (order) {
            const currentStatus = Number(order.statusHistory[order.statusHistory.length - 1].status);

            // Validierung für User (Abbrechen nur wenn Pending)
            if (!isSeller && newStatus === 30 && currentStatus !== 0) {
                throw new Error("order_status_changed_reload");
            }
            // Validierung für Seller (Kein Update wenn bereits gecancelt)
            if (isSeller && (currentStatus === 30 || currentStatus === 31)) {
                throw new Error("order_cancelled_reload");
            }
        }

        return statusMutation.mutateAsync({ orderId, status: newStatus, newStatus, token, comment });
    };

    // useEffect(() => {
    //     if (!socket || !id) return;

    //     const handleOrderUpdate = (payload) => {
    //         // Prüfen, ob das Event für Bestellungen ist
    //         if (payload.type === 'ORDER_UPDATE' || payload.trigger_reason === 'order_stat_upd') {
    //             console.log("📦 Order Update empfangen:", payload);

    //             // Den Cache für die Bestellliste invalidieren
    //             // Das sorgt dafür, dass die Liste im Hintergrund neu geladen wird
    //             if (isSeller) {
    //                 queryClient.invalidateQueries({ queryKey: ['sellerOrders', id] });
    //             } else {
    //                 queryClient.invalidateQueries({ queryKey: ['orders', id] });
    //             }

    //             // Optional: Toast Nachricht anzeigen, falls man nicht im Chat ist
    //             // toast.info(`Status der Bestellung ${payload.orderNumber} hat sich geändert.`);
    //         }
    //     };

    //     socket.on('stats_update', handleOrderUpdate);

    //     return () => {
    //         socket.off('stats_update', handleOrderUpdate);
    //     };
    // }, [id, isSeller, queryClient]);

    return {
        // Daten
        orders: data.orders || [],
        totalOrdersCount: data.totalOrders || 0,
        products: data.products || {},
        totalPages: data.totalPages || 1,
        currentPage: page,

        // Status
        loading: ordersQuery.isLoading || ordersQuery.isFetching,
        updating: statusMutation.isPending,
        error: getErrorMessage(ordersQuery.error) || getErrorMessage(statusMutation.error),

        // Aktionen
        paginate: (newPage) => setPage(newPage),
        applyFilter: (status, search) => {
            setStatusFilter(status);
            setSearchTerm(search);
            setPage(1);
        },
        updateStatus: handleUpdateStatus,
        refetch: ordersQuery.refetch
    };
};