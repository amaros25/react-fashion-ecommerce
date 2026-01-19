import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ORDER_STATUS } from "../utils/const/order_status.js";
import { FaTimes, FaRegCommentDots } from "react-icons/fa";
import OrderItem from "./order_item.js";
import MainOrderCardHeader from "./main_order_card_header.js";
import MainOrderCardFooter from "./main_order_card_footer.js";
import MainOrderCardModals from "./main_order_card_modals.js";

import "./main_order_card.css";

function MainOrderCard({ order, products, t, onStatusChange, onRatingComplete, isUpdating, viewMode = "user" }) {
    const navigate = useNavigate();
    const [commentModal, setCommentModal] = useState({ isOpen: false, targetStatus: null });
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
    const [hasRated, setHasRated] = useState(order.isRated || false);

    const userId = localStorage.getItem("userId");
    const currentStatus = Number(order.currentStatus);
    const isDelivery = order.is_delivery;

    useEffect(() => { if (order.isRated) setHasRated(true); }, [order.isRated]);

    const productArray = useMemo(() =>
        Array.isArray(products) ? products : Object.values(products || {}),
        [products]
    );

    const canRateSeller = () => {
        if (viewMode !== "user" || order.sellerReview || !userId) return false;
        const completion = order.statusHistory?.find(s =>
            [Number(ORDER_STATUS.DELIVERED), Number(ORDER_STATUS.PICKED_UP)].includes(Number(s.status))
        );
        return !!completion && Number(completion.status) === Number(ORDER_STATUS.DELIVERED);
    };

    const renderUserButtons = () => {
        const buttons = [];
        if (currentStatus === Number(ORDER_STATUS.PENDING)) {
            buttons.push(
                <button key="cancel" disabled={isUpdating} className="seller-btn btn-cancel" onClick={() => onStatusChange(order.id, ORDER_STATUS.CANCELLED_USER)}>
                    <FaTimes /> {t("order_state_buttons.cancel")}
                </button>
            );
        }
        return buttons;
    };

    const handleStatusUpdateInitiated = (targetStatus) => {
        // Liste der Status-Codes, die eine Begründung/Kommentar erfordern
        const statusRequiringComment = [
            Number(ORDER_STATUS.CANCELLED_SELLER),
            Number(ORDER_STATUS.RETURN_REFUSED),
            Number(ORDER_STATUS.FIRST_TRY_DELIVERY_FAILED),
            Number(ORDER_STATUS.PICK_UP_FAILED)
        ];

        if (statusRequiringComment.includes(Number(targetStatus))) {
            // Modal öffnen für Begründung
            setCommentModal({ isOpen: true, targetStatus: targetStatus });
        } else {
            // Direktes Update ohne Kommentar
            onStatusChange(order.id, targetStatus);
        }
    };


    const renderSellerButtons = () => {
        const buttons = [];
        const status = Number(currentStatus);

        if (status === Number(ORDER_STATUS.PENDING)) {
            buttons.push(
                <button key="conf" disabled={isUpdating} className="seller-btn btn-confirm" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.CONFIRMED)}>
                    {t("order_state_buttons.confirm")}
                </button>
            );
            buttons.push(
                <button key="can" disabled={isUpdating} className="seller-btn btn-cancel" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.CANCELLED_SELLER)}>
                    <FaTimes /> {t("order_state_buttons.cancel")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.CONFIRMED)) {
            const nextStatus = isDelivery ? ORDER_STATUS.SHIPPED : ORDER_STATUS.READY_TO_PICKUP;
            const label = isDelivery ? t("order_state_buttons.mark_shipped") : t("order_state_buttons.ready_pickup");
            buttons.push(
                <button key="next" disabled={isUpdating} className="seller-btn btn-primary" onClick={() => handleStatusUpdateInitiated(nextStatus)}>
                    {label}
                </button>
            );
            buttons.push(
                <button key="can2" disabled={isUpdating} className="seller-btn btn-cancel-outline" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.CANCELLED_SELLER)}>
                    {t("order_state_buttons.cancel")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.SHIPPED)) {
            buttons.push(
                <button key="del" disabled={isUpdating} className="seller-btn btn-success" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.DELIVERED)}>
                    {t("order_state_buttons.mark_delivered")}
                </button>
            );
            buttons.push(
                <button key="fail" disabled={isUpdating} className="seller-btn btn-warning" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.FIRST_TRY_DELIVERY_FAILED)}>
                    <FaTimes /> {t("order_state_buttons.first_try_delivery_failed")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.READY_TO_PICKUP)) {
            buttons.push(
                <button key="pick" disabled={isUpdating} className="seller-btn btn-success" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.PICKED_UP)}>
                    {t("order_state_buttons.mark_picked_up")}
                </button>
            );
            buttons.push(
                <button key="pickfail" disabled={isUpdating} className="seller-btn btn-warning" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.PICK_UP_FAILED)}>
                    <FaTimes /> {t("order_state_buttons.pickup_failed")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.RETURN_REQUESTED)) {
            buttons.push(
                <button key="ret_acc" disabled={isUpdating} className="seller-btn btn-primary" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.RETURN_CONFIRMED)}>
                    {t("order_state_buttons.accept_return")}
                </button>
            );
            buttons.push(
                <button key="ret_rej" disabled={isUpdating} className="seller-btn btn-cancel" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.RETURN_REFUSED)}>
                    <FaTimes /> {t("order_state_buttons.reject_return")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.RETURN_SHIPPED)) {
            buttons.push(
                <button key="ret_rec" disabled={isUpdating} className="seller-btn btn-success" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.RETURN_RECEIVED)}>
                    {t("order_state_buttons.confirm_return_received")}
                </button>
            );
        }

        return buttons;
    };

    const isChatAllowed = () => {
        const lastStatus = Number(order.currentStatus);
        const allowed = [
            ORDER_STATUS.CONFIRMED, ORDER_STATUS.SHIPPED, ORDER_STATUS.RETURN_REQUESTED, ORDER_STATUS.READY_TO_PICKUP
        ].map(Number);
        return allowed.includes(lastStatus);
    };

    const handleChat = () => {
        const targetId = viewMode === 'seller' ? order.userId : order.sellerId;
        navigate('/chat', { state: { newOrderNumber: order.orderNumber, partnerId: targetId, newChatType: 'order' } });
    };

    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';
    const seenProducts = new Set();

    return (
        <div className={`unified-order-card ${viewMode === "seller" ? "seller-style" : "user-style"}`}>
            <MainOrderCardHeader
                order={order} viewMode={viewMode} t={t} navigate={navigate}
                formattedDate={formattedDate} isDelivery={isDelivery}
                canRateSeller={canRateSeller} setIsSellerModalOpen={setIsSellerModalOpen}
            />

            {viewMode === "seller" && (
                <div className="order-customer-details">
                    <div className="customer-info-block">
                        <span className="info-label">{t("cart_page.customer")}</span>
                        <span className="info-value">{order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : t("loading_user_error")}</span>
                    </div>
                </div>
            )}

            <div className="order-items-container">
                {order.items.map((item, index) => {
                    const isFirst = !seenProducts.has(item.productId);
                    if (isFirst) seenProducts.add(item.productId);
                    return (
                        <OrderItem
                            key={item.id || index} item={item} order={order} t={t} viewMode={viewMode}
                            product={productArray.find(p => p.id === item.productId)}
                            showRatingButton={isFirst} isLast={index === order.items.length - 1}
                            onRateClick={() => setSelectedProductId(item.productId)}
                        />
                    );
                })}
            </div>

            <MainOrderCardFooter
                order={order} t={t} viewMode={viewMode}
                renderUserButtons={renderUserButtons} renderSellerButtons={renderSellerButtons}
            />

            <MainOrderCardModals
                isSellerModalOpen={isSellerModalOpen} setIsSellerModalOpen={setIsSellerModalOpen}
                order={order} onRatingComplete={onRatingComplete}
                selectedProductId={selectedProductId} setSelectedProductId={setSelectedProductId}
                setHasRated={setHasRated} commentModal={commentModal} setCommentModal={setCommentModal}
                onStatusChange={onStatusChange} t={t}
            />

            {isChatAllowed() && (
                <button className="chat-with-seller-main-btn" onClick={handleChat}>
                    <FaRegCommentDots /> {viewMode === "user" ? t("chat_seller") : t("chat_user")}
                </button>
            )}
        </div>
    );
}

export default MainOrderCard;