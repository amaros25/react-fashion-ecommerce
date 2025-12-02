import React from "react";
import OrderItem from "../profile_user/order_item";
import "./seller_order_card.css";
import OrderStatusStepper from "../profile_user/order_status_stepper";
import { ORDER_STATUS } from "../const/order_status";
import { FaCheck, FaTimes, FaTruck, FaBoxOpen, FaClipboardCheck, FaUndo } from "react-icons/fa";

export default function SellerOrderCard({ order, products, t, onStatusChange }) {
    const productArray = Array.isArray(products) ? products : Object.values(products);

    // Get the latest status update
    const currentStatusObj = order.status && order.status.length > 0
        ? order.status[order.status.length - 1]
        : { update: ORDER_STATUS.PENDING };

    const currentStatus = currentStatusObj.update;
    const isDelivery = order.is_delivery;

    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';

    const handlePickUpProduct = () => {
        const buttons = [];
        if (currentStatus === ORDER_STATUS.PENDING) {
            buttons.push(
                <button key="confirm" className="seller-btn btn-confirm" onClick={() => onStatusChange(order._id, ORDER_STATUS.CONFIRMED)}>
                    <FaCheck /> {t("order_state.confirm") || "Confirm"}
                </button>
            );
            buttons.push(
                <button key="cancel" className="seller-btn btn-cancel" onClick={() => onStatusChange(order._id, ORDER_STATUS.CANCELLED_SELLER)}>
                    <FaTimes /> {t("order_state.cancel") || "Cancel"}
                </button>
            );
        }

        // CONFIRMED -> SHIPPED (Delivery) or READY_TO_PICKUP (Pickup)
        else if (currentStatus === ORDER_STATUS.CONFIRMED) {
            buttons.push(
                <button key="ship" className="seller-btn btn-primary" onClick={() => onStatusChange(order._id, ORDER_STATUS.READY_TO_PICKUP)}>
                    <FaTruck /> {t("order_state.ready_pickup") || "Ready for Pickup"}
                </button>
            );
            buttons.push(
                <button key="cancel" className="seller-btn btn-cancel-outline" onClick={() => onStatusChange(order._id, ORDER_STATUS.CANCELLED_SELLER)}>
                    {t("order_state.cancel") || "Cancel"}
                </button>
            );
        }
        else if (currentStatus === ORDER_STATUS.READY_TO_PICKUP) {
            buttons.push(
                <button key="ship" className="seller-btn btn-primary" onClick={() => onStatusChange(order._id, ORDER_STATUS.PICKED_UP)}>
                    <FaTruck /> {t("order_state.picked_up") || "Picked Up"}
                </button>
            );
            buttons.push(
                <button key="cancel" className="seller-btn btn-cancel-outline" onClick={() => onStatusChange(order._id, ORDER_STATUS.PICK_UP_FAILED)}>
                    {t("order_state.pick_up_failed") || "Pick Up Failed"}
                </button>
            );
        }
        return <div className="seller-actions-row">{buttons}</div>;
    };

    const renderActionButtons = () => {
        // Cancelled or Completed states - No actions
        if (
            currentStatus === ORDER_STATUS.CANCELLED_USER ||
            currentStatus === ORDER_STATUS.CANCELLED_SELLER ||
            currentStatus === ORDER_STATUS.DELIVERED ||
            currentStatus === ORDER_STATUS.PICKED_UP ||
            currentStatus === ORDER_STATUS.RETURN_RECEIVED
        ) {
            return null;
        }
        if (!order.is_delivery) {
            return handlePickUpProduct();
        }
        const buttons = [];

        // PENDING -> CONFIRMED or CANCELLED
        if (currentStatus === ORDER_STATUS.PENDING) {
            buttons.push(
                <button key="confirm" className="seller-btn btn-confirm" onClick={() => onStatusChange(order._id, ORDER_STATUS.CONFIRMED)}>
                    <FaCheck /> {t("order_state.confirm") || "Confirm"}
                </button>
            );
            buttons.push(
                <button key="cancel" className="seller-btn btn-cancel" onClick={() => onStatusChange(order._id, ORDER_STATUS.CANCELLED_SELLER)}>
                    <FaTimes /> {t("order_state.cancel") || "Cancel"}
                </button>
            );
        }

        // CONFIRMED -> SHIPPED (Delivery) or READY_TO_PICKUP (Pickup)
        else if (currentStatus === ORDER_STATUS.CONFIRMED) {
            if (isDelivery) {
                buttons.push(
                    <button key="ship" className="seller-btn btn-primary" onClick={() => onStatusChange(order._id, ORDER_STATUS.SHIPPED)}>
                        <FaTruck /> {t("order_state.mark_shipped") || "Mark as Shipped"}
                    </button>
                );
            }
            // Can still cancel if needed? Usually yes, but let's stick to the main flow for now or add cancel as secondary
            buttons.push(
                <button key="cancel" className="seller-btn btn-cancel-outline" onClick={() => onStatusChange(order._id, ORDER_STATUS.CANCELLED_SELLER)}>
                    {t("order_state.cancel") || "Cancel"}
                </button>
            );
        }

        // SHIPPED -> DELIVERED or FIRST TRY FAILED (Delivery)
        else if (currentStatus === ORDER_STATUS.SHIPPED) {
            buttons.push(
                <button key="deliver" className="seller-btn btn-success" onClick={() => onStatusChange(order._id, ORDER_STATUS.DELIVERED)}>
                    <FaClipboardCheck /> {t("order_state.mark_delivered") || "Mark as Delivered"}
                </button>
            );
            buttons.push(
                <button key="failed" className="seller-btn btn-warning" onClick={() => onStatusChange(order._id, ORDER_STATUS.FIRST_TRY_DELIVERY_FAILED)}>
                    <FaTimes /> {t("order_state.first_try_delivery_failed") || "First Try Delivery Failed"}
                </button>
            );
        }

        else if (currentStatus === ORDER_STATUS.FIRST_TRY_DELIVERY_FAILED) {
            buttons.push(
                <button key="deliver" className="seller-btn btn-success" onClick={() => onStatusChange(order._id, ORDER_STATUS.SECOND_TRY_DELIVERY)}>
                    <FaClipboardCheck /> {t("order_state.second_try_delivery") || "Second Try Delivery"}
                </button>
            );
            buttons.push(
                <button key="failed" className="seller-btn btn-warning" onClick={() => onStatusChange(order._id, ORDER_STATUS.CANCELLED_SELLER)}>
                    <FaTimes /> {t("order_state.cancelled") || "Cancelled"}
                </button>
            );
        }

        else if (currentStatus === ORDER_STATUS.SECOND_TRY_DELIVERY) {
            buttons.push(
                <button key="deliver" className="seller-btn btn-success" onClick={() => onStatusChange(order._id, ORDER_STATUS.DELIVERED)}>
                    <FaClipboardCheck /> {t("order_state.mark_delivered") || "Mark as Delivered"}
                </button>
            );
            buttons.push(
                <button key="failed" className="seller-btn btn-warning" onClick={() => onStatusChange(order._id, ORDER_STATUS.FAILED_DELIVERY)}>
                    <FaTimes /> {t("order_state.failed_delivery") || "Failed Delivery"}
                </button>
            );
        }

        // READY_TO_PICKUP -> PICKED_UP or FAILED (Pickup)
        else if (currentStatus === ORDER_STATUS.READY_TO_PICKUP) {
            buttons.push(
                <button key="picked_up" className="seller-btn btn-success" onClick={() => onStatusChange(order._id, ORDER_STATUS.PICKED_UP)}>
                    <FaClipboardCheck /> {t("order_state.mark_picked_up") || "Picked Up"}
                </button>
            );
            buttons.push(
                <button key="pickup_failed" className="seller-btn btn-warning" onClick={() => onStatusChange(order._id, ORDER_STATUS.PICK_UP_FAILED)}>
                    <FaTimes /> {t("order_state.pickup_failed") || "Pickup Failed"}
                </button>
            );
        }

        // RETURN_REQUESTED -> CONFIRMED or REFUSED
        else if (currentStatus === ORDER_STATUS.RETURN_REQUESTED) {
            buttons.push(
                <button key="accept_return" className="seller-btn btn-primary" onClick={() => onStatusChange(order._id, ORDER_STATUS.RETURN_CONFIRMED)}>
                    <FaUndo /> {t("order_state.accept_return") || "Accept Return"}
                </button>
            );
            buttons.push(
                <button key="reject_return" className="seller-btn btn-cancel" onClick={() => onStatusChange(order._id, ORDER_STATUS.RETURN_REFUSED)}>
                    <FaTimes /> {t("order_state.reject_return") || "Reject Return"}
                </button>
            );
        }

        // RETURN_SHIPPED -> RECEIVED or NOT RECEIVED
        else if (currentStatus === ORDER_STATUS.RETURN_SHIPPED) {
            buttons.push(
                <button key="return_received" className="seller-btn btn-success" onClick={() => onStatusChange(order._id, ORDER_STATUS.RETURN_RECEIVED)}>
                    <FaCheck /> {t("order_state.confirm_return_received") || "Confirm Return Received"}
                </button>
            );
            buttons.push(
                <button key="return_not_received" className="seller-btn btn-warning" onClick={() => onStatusChange(order._id, ORDER_STATUS.RETURN_NOT_RECEIVED)}>
                    <FaTimes /> {t("order_state.return_not_received") || "Return Not Received"}
                </button>
            );
        }

        return <div className="seller-actions-row">{buttons}</div>;
    };

    return (
        <div className="seller-order-card">
            <div className="order-card-header">
                <div className="order-header-left">
                    <span className="order-id-label">{t("order_id") || "Order ID"}</span>
                    <span className="order-id-value">#{order.orderNumber}</span>
                    {formattedDate && <span className="order-date">• {formattedDate}</span>}
                    <span className={`order-type-badge ${isDelivery ? 'delivery' : 'pickup'}`}>
                        {isDelivery ? (t("delivery") || "Delivery") : (t("pickup") || "Pickup")}
                    </span>
                </div>
                <div className="order-header-right">
                    <span className="order-total-label">{t("total") || "Total"}:</span>
                    <span className="order-total-value">€{order.totalPrice.toFixed(2)}</span>
                </div>
            </div>

            <div className="order-customer-details">
                <div className="customer-info-block">
                    <span className="info-label">{t("customer") || "Customer"}:</span>
                    <span className="info-value">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : t("guest_user")}
                    </span>
                </div>
                {isDelivery && order.user?.address && (
                    <div className="customer-info-block">
                        <span className="info-label">{t("shipping_address") || "Shipping"}:</span>
                        <span className="info-value">
                            {order.user.address.street}, {order.user.address.city}
                        </span>
                    </div>
                )}
            </div>

            <div className="order-items-container">
                {order.items.map((item, index) => {
                    const product = productArray.find(p => p._id === item.productId);
                    return (
                        <OrderItem
                            key={item._id}
                            item={item}
                            product={product}
                            order={order}
                            t={t}
                            isLast={false} // We don't want the user-side buttons here
                        />
                    );
                })}
            </div>

            <div className="order-card-footer">
                <OrderStatusStepper order={order} t={t} />
                {renderActionButtons()}
            </div>
        </div>
    );
}
