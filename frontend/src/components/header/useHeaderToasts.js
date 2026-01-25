import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next"; // Neu importiert
import toast from 'react-hot-toast';
import { socket } from '../../context/socket';

export const useHeaderToasts = (user) => {
    const location = useLocation();
    const { t } = useTranslation(); // Initialisierung der Übersetzung

    useEffect(() => {
        const handleStatsUpdate = (newData) => {
            const isChatPage = location.pathname.includes('/chat');

            // 1. STATUS-CHECK
            if (newData.toastMessage === "st" && newData.active) {
                if (newData.active !== user?.active) {
                    const statusKey = newData.active.toLowerCase();
                    const translatedStatus = t(`user_status.${statusKey}`);
                    toast.success(t("toast.status_change", { status: translatedStatus }), {
                        id: 'status-info',
                    });
                }
            }

            // 2. NEUE NACHRICHTEN
            if (newData.toastMessage === "nm" && !isChatPage) {
                if (newData.unreadMessages > (user?.unreadMessages || 0)) {
                    // Nutzt Key 'toast.new_message'
                    toast.success(t("toast.new_message"), { id: 'msg' });
                }
            }

            // 3. BESTELL-UPDATE
            if (newData.toastMessage === "od") {
                // Nutzt Key 'toast.order_update' und übergibt die Ordernummer
                toast.success(t("toast.order_update", { number: newData.orderNumber }), {
                    id: `order-${newData.orderNumber}`,
                });
            }
        };

        socket.on('stats_update', handleStatsUpdate);
        return () => socket.off('stats_update', handleStatsUpdate);

    }, [location.pathname, user?.active, user?.unreadMessages, t]); // t hinzugefügt
};