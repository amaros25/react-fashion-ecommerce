import React from "react";
import { FaStar, FaRegStar, FaExclamationCircle } from "react-icons/fa";
import "./css/main_order_card_header.css"

const MainOrderCardHeader = ({
    order, viewMode, t, formattedDate, isDelivery,
    canRateSeller, setIsSellerModalOpen, navigate
}) => {
    const renderSellerStars = (rating) => (
        <div className="moch-stars">
            {[...Array(5)].map((_, i) => (
                i < rating ? <FaStar key={i} className="star-active" /> : <FaRegStar key={i} color="#e5e5e5" />
            ))}
        </div>
    );
    isDelivery = false;

    return (
        <div className="moch-container">
            <div className="moch-left-section">
                {viewMode === "user" && order.seller?.shopName && (
                    <div className="moch-shop-info">
                        <span className="moch-shop-name">{order.seller.shopName}</span>
                        {viewMode === "user" && (
                            <div className="moch-badge-wrapper">
                                <div className="moch-rating-zone">
                                    {order.sellerReview ? (
                                        <div className="moch-rated-container">
                                            <span className="moch-mini-label">{t("your_seller_rating")}:</span>
                                            {renderSellerStars(order.sellerReview.rating)}
                                        </div>
                                    ) : canRateSeller() ? (
                                        <button className="moch-rate-btn" onClick={() => setIsSellerModalOpen(true)}>
                                            <FaStar className="icon" /> {t("rate_seller")}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="moch-meta-wrapper">
                    <span className="moch-id-label">{t("orderNumber")}</span>
                    <span className="moch-id-value">{order.orderNumber}</span>
                    {formattedDate && <span className="moch-date"> {formattedDate}</span>}
                    <div className="moch-badge-wrapper">
                        <span className={`moch-badge ${isDelivery ? 'delivery' : 'pickup'}`}>
                            {isDelivery ? t("delivery") : t("pickup")}
                        </span>
                    </div>
                </div>
            </div>
            <div className="moch-right-section">
                <div className="moch-price-row">
                    <span className="moch-total-label">{t("cart_page.total")}:</span>
                    <span className="moch-price">{Number(order.totalPrice || 0).toFixed(3)} {t("price_suf")}</span>
                </div>

                {viewMode === "user" && (
                    <div className="moch-report-link" onClick={() => navigate("/help-center", { state: { orderNumber: order.orderNumber } })}>
                        <FaExclamationCircle className="report-order-icon" />
                        <span className="report-text">{t("report_order")}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainOrderCardHeader;