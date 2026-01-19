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

    return (
        <div className="moch-container">
            <div className="moch-left-section">
                {/* Desktop Group: Shop Name + Rating */}
                <div className="moch-group-shop">
                    {viewMode === "user" && order.seller?.shopName && (
                        <div className="moch-shop-info">
                            <span className="moch-shop-name">{order.seller.shopName}</span>
                            {/* Separator removed from here to separate logic */}
                        </div>
                    )}

                    {viewMode === "user" && (
                        <>
                            {order.seller?.shopName && <div className="moch-separator-line"></div>}
                            <div className="moch-rating-zone">
                                {order.sellerReview ? (
                                    <div className="moch-rated-container">
                                        <span className="moch-mini-label">{t("your_seller_rating")}:</span>
                                        {renderSellerStars(order.sellerReview.rating)}
                                    </div>
                                ) : canRateSeller() ? (
                                    <button className="moch-rate-btn" onClick={() => setIsSellerModalOpen(true)}>
                                        {t("rate_seller")}
                                    </button>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>

                {/* Desktop Group: Meta + Badge */}
                <div className="moch-group-meta">
                    <div className="moch-meta-wrapper">
                        <span className="moch-id-label">{t("orderNumber")}</span>
                        <span className="moch-id-value">{order.orderNumber}</span>
                        {formattedDate && <span className="moch-date"> {formattedDate}</span>}
                    </div>

                    <div className="moch-separator-line"></div>

                    <span className={`moch-badge ${isDelivery ? 'delivery' : 'pickup'}`}>
                        {isDelivery ? t("delivery") : t("pickup")}
                    </span>
                </div>
            </div>

            <div className="moch-right-section">
                <div className="moch-group-price">
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