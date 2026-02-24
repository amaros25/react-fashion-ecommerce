import React from "react";
import { FaStar, FaRegStar, FaExclamationCircle } from "react-icons/fa";
import "./css/main_order_card_header.css"
import { ORDER_STATUS } from "../utils/const/order_status.js";
import { FaRegCommentDots } from "react-icons/fa";
import { cities, citiesData } from '../utils/const/cities';

const MainOrderCardHeader = ({
    order, viewMode, t, formattedDate, isDelivery,
    canRateSeller, setIsSellerModalOpen, navigate, onChatClick
}) => {
    const renderSellerStars = (rating) => (
        <div className="moch-stars">
            {[...Array(5)].map((_, i) => (
                i < rating ? <FaStar key={i} className="star-active" /> : <FaRegStar key={i} color="#e5e5e5" />
            ))}
        </div>
    );

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

    const currentStatus = Number(order.currentStatus);
    const showContactInfo = viewMode === "seller" && currentStatus >= Number(ORDER_STATUS.CONFIRMED);
    let buyerPhone = "";
    let buyerCompleteAddress = "";
    let buyerCityText = "";
    let buyerSubCityText = "";

    try {
        buyerPhone = order.buyerSnapshot?.p;
    } catch (error) {
        console.log("error", error);
        buyerPhone = t("failed_load_address");
    }
    try {
        const buyerAddress = order.buyerSnapshot?.a;
        buyerCityText = cities[order.buyerSnapshot?.c];
        buyerSubCityText = citiesData[buyerCityText][order.buyerSnapshot?.sc];
        buyerCompleteAddress = `${buyerAddress}, ${buyerSubCityText}, ${buyerCityText}`;
    } catch (error) {
        console.log("error", error);
        buyerCompleteAddress = t("failed_load_address");
    }


    return (
        <div className="moch-container">
            <div className="moch-left-section">
                {/* Desktop Group: Shop Name + Rating */}
                <div className="moch-group-shop">
                    {viewMode === "seller" && (
                        <div className="moch-group-shop">
                            {!showContactInfo && isDelivery && (
                                <div className="moch-meta-wrapper">
                                    <span className="moch-mini-label">{t("register.city")} & {t("register.subCity")}: </span>
                                    <span className="info-value">{buyerCityText} {buyerSubCityText}</span>
                                </div>
                            )}
                            {showContactInfo && order.buyerSnapshot && (
                                <>
                                    <div className="moch-meta-wrapper">
                                        <span className="moch-mini-label">{t("cart_page.customer")}</span>
                                        <span className="info-value">{order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : t("loading_user_error")}</span>
                                    </div>
                                    {isDelivery && (
                                        <div className="moch-meta-wrapper">
                                            <span className="moch-separator-line"></span>
                                            <span className="moch-mini-label">{t("address")}</span>
                                            <span className="info-value">{buyerCompleteAddress}</span>
                                        </div>
                                    )}
                                    <div className="moch-meta-wrapper">
                                        <span className="moch-separator-line"></span>
                                        <span className="moch-mini-label">{t("phone")}</span>
                                        <span className="info-value">{buyerPhone}</span>
                                    </div>
                                </>
                            )}

                            {renderChatButton()}
                        </div>
                    )}
                    {viewMode === "user" && order.seller?.shopName && (
                        <div className="moch-shop-info">
                            <span className="moch-shop-name">{order.seller.shopName}</span>
                            <div className="moch-separator-line"></div>
                            {renderChatButton()}

                        </div>
                    )}
                    {viewMode === "user" && (
                        <>
                            <div className="moch-rating-zone">
                                {order.sellerReview ? (
                                    <div className="moch-rated-container">
                                        <span className="moch-mini-label">{t("your_seller_rating")}:</span>
                                        {renderSellerStars(order.sellerReview.rating)}
                                    </div>
                                ) : canRateSeller() ? (
                                    <button className="order-card-btn-small" onClick={() => setIsSellerModalOpen(true)}>
                                        <FaStar /> {t("rate_seller")}
                                    </button>
                                ) : null}
                            </div>
                        </>
                    )}

                </div>

                {/* Desktop Group: Meta + Badge */}
                <div className="moch-group-meta">
                    <div className="moch-meta-wrapper">
                        <span className="moch-mini-label">{t("orderNumber")}</span>
                        <span className="moch-id-value">{order.orderNumber}</span>
                        <div className="moch-separator-line"></div>
                        <span className="moch-mini-label">{t("orderDate")}</span>
                        {formattedDate && <span className="moch-id-value"> {formattedDate}</span>}
                    </div>
                    <div className="moch-separator-line"></div>
                    <span className={`moch-badge ${isDelivery ? 'delivery' : 'pickup'}`}>
                        {isDelivery ? t("cart_page.delivery") : t("cart_page.pickup")}
                    </span>
                </div>
            </div>

            <div className="moch-right-section">
                <div className="moch-group-price">
                    <span className="moch-total-label">{t("cart_page.total")}:</span>
                    <span className="moch-price">{Number(order.totalPrice || 0).toFixed(3)} {t("price_suf")}</span>
                </div>
                <div className="order-card-btn-small" onClick={() => navigate("/help-center", { state: { orderNumber: order.orderNumber } })}>
                    <FaExclamationCircle /> {t("report_order")}
                </div>


            </div>
        </div>
    );
};

export default MainOrderCardHeader;