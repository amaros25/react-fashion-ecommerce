import React from "react";
import { FaStar, FaRegStar, FaExclamationCircle } from "react-icons/fa";
import "./css/main_order_card_header.css"
import { ORDER_STATUS } from "../utils/const/order_status.js";
import { FaRegCommentDots } from "react-icons/fa";

import RatingTrigger from "./RatingTrigger.js";

const MainOrderCardHeader = ({
    order, viewMode, t, formattedDate, isDelivery,
    canRateSeller, setIsSellerModalOpen, navigate, onChatClick
}) => {
    const isChatAllowed = () => {
        const lastStatus = Number(order.currentStatus);
        const allowed = [
            ORDER_STATUS.CONFIRMED, ORDER_STATUS.SHIPPED, ORDER_STATUS.RETURN_REQUESTED, ORDER_STATUS.READY_TO_PICKUP
        ].map(Number);
        return allowed.includes(lastStatus);
    };


    const renderChatButton = () => {
        if (!isChatAllowed()) return null;
        return (
            <div
                className="chat-icon-only-wrapper"
                onClick={onChatClick}
                role="button"
                title={viewMode === "user" ? t("chat_seller") : t("chat_user")}
            >
                <div className="moch-separator-line"></div>
                <FaRegCommentDots className="chat-icon-large" />
            </div>
        );
    };

    const itemsCount = order.items?.length || 0;

    return (
        <div className="moch-container">
            <div className="moch-desktop-left">
                {/* ROW 1 LEFT (Mobile) / Top Left (PC) */}
                <div className="moch-unit-shop">
                    <div className="moch-shop-info">
                        <span className="moch-shop-name">
                            {viewMode === "seller" ? (order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : t("cart_page.customer")) : (order.seller?.shopName || t("loading"))}
                        </span>

                        {/* Rating Trigger next to shop name, BEFORE badge */}
                        {viewMode === "user" && [
                            ORDER_STATUS.DELIVERED,
                            ORDER_STATUS.PICKED_UP,
                            ORDER_STATUS.RETURN_RECEIVED
                        ].includes(Number(order.currentStatus)) && (
                                <div className="moch-rating-trigger-inline">
                                    <RatingTrigger
                                        rating={order.sellerReview?.rating}
                                        isRated={!!order.sellerReview}
                                        canRate={canRateSeller()}
                                        onRateClick={() => setIsSellerModalOpen(true)}
                                        t={t}
                                        label={order.sellerReview ? t("your_seller_rating") : undefined}
                                    />
                                </div>
                            )}

                        <span className={`moch-badge pc-only ${isDelivery ? 'delivery' : 'pickup'}`}>
                            {isDelivery ? t("cart_page.delivery") : t("cart_page.pickup")}
                        </span>
                    </div>
                    {renderChatButton()}
                </div>

                {/* ROW 2 LEFT (Mobile) / Bottom Left (PC) */}
                <div className="moch-unit-meta">
                    <div className="moch-meta-wrapper">
                        <span className="moch-mini-label">{t("orderNumber")}</span>
                        <span className="moch-id-value">{order.orderNumber}</span>

                        {formattedDate && (
                            <span className="moch-date-pc pc-only">
                                <span className="moch-separator-dot">•</span>
                                {formattedDate}
                            </span>
                        )}

                        {/* Badge next to order number on mobile */}
                        <span className={`moch-badge mobile-only ${isDelivery ? 'delivery' : 'pickup'}`}>
                            {isDelivery ? t("cart_page.delivery") : t("cart_page.pickup")}
                        </span>
                    </div>
                </div>
            </div>

            {/* ROW 1 RIGHT & ROW 2 RIGHT (Mobile) / Right Section (PC) */}
            <div className="moch-desktop-right">
                {/* Mobile Row 1 Right */}
                <div className="moch-unit-date-mobile">
                    {formattedDate && <span className="moch-date-text-mobile">{formattedDate}</span>}
                </div>

                <div className="moch-unit-price-row">
                    <div className="moch-unit-price">
                        <span className="moch-total-label pc-only">{t("cart_page.total")}:</span>
                        <span className="moch-price">{Number(order.totalPrice || 0).toFixed(3)} {t("price_suf")}</span>
                    </div>

                    <div className="moch-unit-report" onClick={() => navigate("/help-center", { state: { orderNumber: order.orderNumber } })}>
                        <FaExclamationCircle className="moch-report-icon" />
                        <span className="moch-report-text-pc">{t("report_order")}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};



export default MainOrderCardHeader;