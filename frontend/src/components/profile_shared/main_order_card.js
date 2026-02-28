import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ORDER_STATUS } from "../utils/const/order_status.js";
import OrderItem from "./order_item.js";
import { FaTimes, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

import MainOrderCardHeader from "./main_order_card_header.js";
import MainOrderCardFooter from "./main_order_card_footer.js";
import MainOrderCardModals from "./main_order_card_modals.js";
import { cities, citiesData } from '../utils/const/cities';

import "./css/main_order_card.css";

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
        const hasCompletedStatus = order.statusHistory?.some(s =>
            [
                Number(ORDER_STATUS.DELIVERED),
                Number(ORDER_STATUS.PICKED_UP),
                Number(ORDER_STATUS.RETURN_RECEIVED)
            ].includes(Number(s.status))
        );

        return !!hasCompletedStatus;
    };

    const renderUserButtons = () => {
        const buttons = [];
        if (currentStatus === Number(ORDER_STATUS.PENDING)) {
            buttons.push(
                <button key="cancel" disabled={isUpdating} className="order-card-btn btn-cancel" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.CANCELLED_USER)}>
                    <FaTimes /> {t("order_state_buttons.cancel")}
                </button>
            );
        }
        return buttons;
    };

    const handleStatusUpdateInitiated = (targetStatus) => {
        const statusRequiringComment = [
            Number(ORDER_STATUS.CANCELLED_USER),
            Number(ORDER_STATUS.CANCELLED_SELLER),
            Number(ORDER_STATUS.RETURN_REFUSED),
            Number(ORDER_STATUS.PICK_UP_FAILED),
            Number(ORDER_STATUS.FAILED_DELIVERY), // Neu hinzugefügt
            Number(ORDER_STATUS.FIRST_TRY_DELIVERY_FAILED) // Falls du diesen Key noch nutzt
        ];

        if (statusRequiringComment.includes(Number(targetStatus))) {
            setCommentModal({ isOpen: true, targetStatus: targetStatus });
        } else {
            onStatusChange(order.id, targetStatus);
        }
    };

    const renderSellerButtons = () => {
        const buttons = [];
        const status = Number(currentStatus);

        if (status === Number(ORDER_STATUS.PENDING)) {
            buttons.push(
                <button key="conf" disabled={isUpdating} className="order-card-btn btn-confirm" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.CONFIRMED)}>
                    {t("order_state_buttons.confirm")}
                </button>
            );
            buttons.push(
                <button key="can" disabled={isUpdating} className="order-card-btn btn-cancel" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.CANCELLED_SELLER)}>
                    <FaTimes /> {t("order_state_buttons.cancel")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.CONFIRMED)) {
            const nextStatus = isDelivery ? ORDER_STATUS.SHIPPED : ORDER_STATUS.READY_TO_PICKUP;
            const label = isDelivery ? t("order_state_buttons.mark_shipped") : t("order_state_buttons.ready_pickup");
            buttons.push(
                <button key="next" disabled={isUpdating} className="order-card-btn btn-confirm-step" onClick={() => handleStatusUpdateInitiated(nextStatus)}>
                    {label}
                </button>
            );
            buttons.push(
                <button key="can2" disabled={isUpdating} className="order-card-btn btn-cancel-outline" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.CANCELLED_SELLER)}>
                    {t("order_state_buttons.cancel")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.SHIPPED)) {
            // VEREINFACHTE LOGIK: Nur noch Delivered oder Failed
            buttons.push(
                <button key="del" disabled={isUpdating} className="order-card-btn btn-success" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.DELIVERED)}>
                    {t("order_state_buttons.mark_delivered")}
                </button>
            );
            buttons.push(
                <button key="fail" disabled={isUpdating} className="order-card-btn btn-danger" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.FAILED_DELIVERY)}>
                    <FaTimes /> {t("order_state_buttons.mark_failed_delivery")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.READY_TO_PICKUP)) {
            buttons.push(
                <button key="pick" disabled={isUpdating} className="order-card-btn btn-success" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.PICKED_UP)}>
                    {t("order_state_buttons.mark_picked_up")}
                </button>
            );
            buttons.push(
                <button key="pickfail" disabled={isUpdating} className="order-card-btn btn-warning" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.PICK_UP_FAILED)}>
                    <FaTimes /> {t("order_state_buttons.pickup_failed")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.RETURN_REQUESTED)) {
            buttons.push(
                <button key="ret_acc" disabled={isUpdating} className="order-card-btn btn-confirm-step" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.RETURN_CONFIRMED)}>
                    {t("order_state_buttons.accept_return")}
                </button>
            );
            buttons.push(
                <button key="ret_rej" disabled={isUpdating} className="order-card-btn btn-cancel" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.RETURN_REFUSED)}>
                    <FaTimes /> {t("order_state_buttons.reject_return")}
                </button>
            );
        }
        else if (status === Number(ORDER_STATUS.RETURN_SHIPPED)) {
            buttons.push(
                <button key="ret_rec" disabled={isUpdating} className="order-card-btn btn-success" onClick={() => handleStatusUpdateInitiated(ORDER_STATUS.RETURN_RECEIVED)}>
                    {t("order_state_buttons.confirm_return_received")}
                </button>
            );
        }
        // Der alte Block für FIRST_TRY_DELIVERY_FAILED wurde entfernt, 
        // da wir direkt von SHIPPED zu FAILED springen.

        return buttons;
    };



    const handleChat = () => {
        const targetId = viewMode === 'seller' ? order.userId : order.sellerId;
        navigate('/chat', {
            state: {
                newOrderNumber: order.orderNumber,
                orderId: order.id,
                partnerId: targetId,
                newChatType: 'order'
            }
        });
    };



    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';
    const seenProducts = new Set();


    const showContactInfo = viewMode === "seller" && currentStatus >= Number(ORDER_STATUS.CONFIRMED);
    let buyerPhone = "";
    let buyerCompleteAddress = "";
    let buyerCityText = "";
    let buyerSubCityText = "";

    try {
        buyerPhone = order.buyerSnapshot?.p;
    } catch (error) {
        buyerPhone = t("failed_load_address");
    }
    try {
        const buyerAddress = order.buyerSnapshot?.a;
        buyerCityText = cities[order.buyerSnapshot?.c];
        buyerSubCityText = citiesData[buyerCityText][order.buyerSnapshot?.sc];
        buyerCompleteAddress = `${buyerAddress}, ${buyerSubCityText}, ${buyerCityText}`;
    } catch (error) {
        buyerCompleteAddress = t("failed_load_address");
    }

    console.log("order", order);



    return (
        <div className={`unified-order-card ${viewMode === "seller" ? "seller-style" : "user-style"}`}>

            <MainOrderCardHeader
                order={order} viewMode={viewMode} t={t} navigate={navigate}
                formattedDate={formattedDate} isDelivery={isDelivery}
                canRateSeller={canRateSeller} setIsSellerModalOpen={setIsSellerModalOpen}
                onChatClick={handleChat}
            />


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

            {viewMode === "seller" && showContactInfo && (
                <div className="card-order-customer-details">
                    <h4 className="customer-details-title">{t("cart_page.customer_info", { defaultValue: t("contact_info") || "Contact Information" })}</h4>
                    <div className="customer-info-paragraph">
                        <div className="customer-info-line">
                            <FaPhoneAlt fontSize={13} />
                            <span className="info-value-buyer">{buyerPhone}</span>
                        </div>
                        {isDelivery && (
                            <div className="customer-info-line">
                                <FaMapMarkerAlt fontSize={13} />
                                <span className="info-value-buyer">{buyerCompleteAddress}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
        </div>
    );

}

export default MainOrderCard;