import { useState, useEffect, useMemo } from "react";
import { fetchOrderByNumber } from "../chat_api";
import { ORDER_STATUS } from "../../utils/const/order_status";

/**
 * Hook to manage chat restrictions based on order status.
 * Chats for orders are disabled after certain final states or time periods.
 */
export const useChatRestrictions = (activeChat, token) => {
    const [isChatDisabled, setIsChatDisabled] = useState(false);

    useEffect(() => {
        const checkChatRestriction = async () => {
            // Restriction logic only applies to 'order' type chats with a valid number
            if (activeChat?.type === "order" && activeChat.number && token) {
                const result = await fetchOrderByNumber(activeChat.number, token);

                if (result.success) {
                    const order = result.data;
                    const currentStatus = order.status[order.status.length - 1].update;
                    const now = new Date();

                    // Rules for Delivery/Pick-up
                    const deliveredStatus = order.status.find(s =>
                        s.update === ORDER_STATUS.DELIVERED || s.update === ORDER_STATUS.PICKED_UP
                    );

                    let isExpired = false;
                    if (deliveredStatus) {
                        const deliveryDate = new Date(deliveredStatus.date);
                        const diffHours = (now - deliveryDate) / (1000 * 60 * 60);

                        // PICKED_UP is instant expiry
                        if (currentStatus === ORDER_STATUS.PICKED_UP) {
                            isExpired = true;
                        }
                        // DELIVERED expires after 24 hours
                        else if (currentStatus === ORDER_STATUS.DELIVERED && diffHours > 24) {
                            isExpired = true;
                        }
                    }

                    // Return statuses override expiration (you can still chat during a return)
                    const activeReturnStatuses = [
                        ORDER_STATUS.RETURN_REQUESTED,
                        ORDER_STATUS.RETURN_CONFIRMED,
                        ORDER_STATUS.RETURN_SHIPPED,
                        ORDER_STATUS.RETURN_RECEIVED,
                        ORDER_STATUS.RETURN_NOT_RECEIVED
                    ];

                    const isCancelled = currentStatus === ORDER_STATUS.CANCEL_USER || currentStatus === ORDER_STATUS.CANCEL_SELLER;

                    // Final negative statuses where chat is no longer useful
                    const isNegativeFinal = [
                        ORDER_STATUS.FAILED_DELIVERY,
                        ORDER_STATUS.PICK_UP_FAILED,
                        ORDER_STATUS.NO_RESPONSE
                    ].includes(currentStatus);

                    // If expired, cancelled, or negative final, and NOT in return process -> Disable
                    if ((isExpired || isCancelled || isNegativeFinal) && !activeReturnStatuses.includes(currentStatus)) {
                        setIsChatDisabled(true);
                    } else {
                        setIsChatDisabled(false);
                    }
                }
            } else {
                // Non-order chats (product/general) are always enabled
                setIsChatDisabled(false);
            }
        };

        checkChatRestriction();
    }, [activeChat, token]);

    return useMemo(() => ({ isChatDisabled, setIsChatDisabled }), [isChatDisabled]);
};
