import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useOrderRatingManager } from '../api_managers/useOrderRatingManager.js';
import './css/order_rating_modal.css';

const StarRating = ({ rating, onRate, maxStars = 5, disabled = false }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className={`orm-star-container ${disabled ? 'disabled' : ''}`}>
            {[...Array(maxStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button"
                        key={starValue}
                        className="orm-star-btn"
                        onClick={() => !disabled && onRate(starValue)}
                        onMouseEnter={() => !disabled && setHover(starValue)}
                        onMouseLeave={() => !disabled && setHover(0)}
                        disabled={disabled}
                    >
                        {starValue <= (hover || rating) ? (
                            <FaStar className="orm-star-icon active" />
                        ) : (
                            <FaRegStar className="orm-star-icon" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default function OrderRatingModal({ order, products, onClose, onRatingComplete }) {
    const { t } = useTranslation();

    // Hole userId und token (meistens aus einem Auth-Context oder localStorage)
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // Nutze den neuen Manager
    const {
        sellerRating,
        setSellerRating,
        productRatings,
        isSubmitting,
        handleProductRatingChange,
        submitRatings
    } = useOrderRatingManager(order, userId, token, onRatingComplete);

    // Hilfslogik für die Anzeige
    const productArray = Array.isArray(products) ? products : Object.values(products || {});

    // Verkäufer-Info (Seller-Objekt kommt meist über die Order-Relation vom Backend)
    const shopName = order.seller?.shopName || t("seller");
    const sellerImage = order.seller?.image || "/placeholder.png";

    return ReactDOM.createPortal(
        <div className="orm-overlay" onClick={onClose}>
            <div className="orm-content" onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div className="orm-header">
                    <h2>{t("evaluate_experience")}</h2>
                    <button className="orm-close-btn" onClick={onClose} disabled={isSubmitting}>
                        <FaTimes />
                    </button>
                </div>

                <div className="orm-body">
                    <div className="orm-order-ref">
                        <span>
                            {t("order_number")}: {order.orderNumber}
                        </span>
                    </div>

                    <hr className="orm-divider" />

                    {/* SELLER RATING */}
                    <div className="orm-section">
                        <h3 className="orm-section-title">{t("rate_seller")}</h3>
                        <div className="orm-seller-group">
                            <div className="orm-seller-profile">
                                <img
                                    src={sellerImage}
                                    alt={shopName}
                                    className="orm-seller-img"
                                    onError={(e) => { e.target.src = "/placeholder.png" }}
                                />
                                <span className="orm-shop-name">{shopName}</span>
                            </div>
                            <div className="orm-seller-stars">
                                <StarRating
                                    rating={sellerRating}
                                    onRate={setSellerRating}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="orm-divider" />

                    {/* PRODUCTS RATING */}
                    <div className="orm-section">
                        <h3 className="orm-section-title">{t("rate_products")}</h3>
                        {order.items.map(item => {
                            const product = productArray.find(p => (p._id === item.productId || p.id === item.productId));
                            const ratingData = productRatings[item.productId];
                            const prodImage = product?.images?.[0]?.url || "/placeholder.png";

                            return (
                                <div key={item.productId} className="orm-product-item">
                                    <div className="orm-product-profile">
                                        <img src={prodImage} alt="" className="orm-product-img" />
                                        <span className="orm-product-name">{product?.name || item.name}</span>
                                    </div>
                                    <div className="orm-rating-block">
                                        <StarRating
                                            rating={ratingData.rating}
                                            onRate={(val) => handleProductRatingChange(item.productId, 'rating', val)}
                                            disabled={isSubmitting}
                                        />
                                        <textarea
                                            className="orm-comment-box"
                                            placeholder={t("add_comment_placeholder")}
                                            value={ratingData.comment}
                                            onChange={(e) => handleProductRatingChange(item.productId, 'comment', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="orm-footer">
                    <button className="orm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                        {t("cancel")}
                    </button>
                    <button className="orm-btn-submit" onClick={submitRatings} disabled={isSubmitting}>
                        {isSubmitting ? t("submitting") : t("submit_rating")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}