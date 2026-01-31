import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import toast from 'react-hot-toast';
import { socket } from '../../context/socket';
import { useQueryClient } from '@tanstack/react-query';

export const useHeaderToasts = (user) => {
    const location = useLocation();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket || !user?.id) return;

        const handleStatsUpdate = (newData) => {
            console.log("📩 useHeaderToasts: Stats Update empfangen", newData);
            const isChatPage = location.pathname.includes('/chat');
            const userIdString = String(user.id);

            // 1. OPTIMISTISCHES CACHE-UPDATE (Damit Badges sofort stimmen)
            queryClient.setQueryData(['user', userIdString], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    unreadMessages: (newData.unreadMessages !== undefined) ? newData.unreadMessages : oldData.unreadMessages,
                    openOrders: (newData.openOrders !== undefined) ? newData.openOrders : oldData.openOrders
                };
            });

            // 2. STATUS-CHECK
            if (newData.toastMessage === "st" && newData.active) {
                if (newData.active !== user?.active) {
                    const statusKey = newData.active.toLowerCase();
                    const translatedStatus = t(`user_status.${statusKey}`);
                    toast.success(t("toast.status_change", { status: translatedStatus }), {
                        id: 'status-info',
                    });
                }
            }

            // 3. BESTELL-UPDATE / AUTO-REFRESH (F5 Fix)
            if (newData.toastMessage === "od" || newData.trigger_reason === 'orders_update' || newData.trigger_reason === 'order_stat_upd') {
                const sId = String(newData.sellerId || userIdString);
                const bId = String(newData.userId || userIdString);

                // Invalidiere Listen
                queryClient.invalidateQueries({ queryKey: ['seller-orders', sId] });
                queryClient.invalidateQueries({ queryKey: ['orders', bId] });
                queryClient.invalidateQueries({ queryKey: ['unread-count', sId] });
                queryClient.invalidateQueries({ queryKey: ['unread-count', bId] });

                // Erzwinge Refetch für aktive Seller-Liste
                queryClient.refetchQueries({
                    queryKey: ['seller-orders', sId],
                    type: 'active',
                    exact: false
                });

                // Zeige Toast nur bei echtem "od" Typ
                if (newData.toastMessage === "od") {
                    toast.success(t("toast.order_update", { number: newData.orderNumber }), {
                        id: `order-${newData.orderNumber}`,
                    });
                }
            }

            // 4. NEUE NACHRICHTEN TOAST
            if (newData.toastMessage === "nm" && !isChatPage) {
                if (newData.unreadMessages > (user?.unreadMessages || 0)) {
                    toast.success(t("toast.new_message"), { id: 'msg' });
                }
            }
        };

        socket.on('stats_update', handleStatsUpdate);
        return () => socket.off('stats_update', handleStatsUpdate);

    }, [location.pathname, user?.id, user?.active, user?.unreadMessages, t, queryClient]);
};