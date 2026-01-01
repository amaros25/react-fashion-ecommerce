import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useOrderRating } from './hooks/useOrderRating';
import './OrderRatingModal.css';

const StarRating = ({ rating, onRate, maxStars = 5 }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating-container">
            {[...Array(maxStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button"
                        key={starValue}
                        className="star-btn"
                        onClick={() => onRate(starValue)}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        {starValue <= (hover || rating) ? (
                            <FaStar className="star-icon active" />
                        ) : (
                            <FaRegStar className="star-icon" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default function OrderRatingModal({ order, products, onClose, onRatingComplete }) {
    const { t } = useTranslation();
    const {
        seller,
        sellerRating,
        setSellerRating,
        productRatings,
        handleProductRatingChange,
        submitRatings,
        submitting
    } = useOrderRating(order, onRatingComplete);

    const productArray = Array.isArray(products) ? products : Object.values(products);

    // Use fetched seller info, fallback to order info (if populated) or placeholder
    const sellerImage = seller?.image || order.seller?.logo || order.seller?.image || "/placeholder.png";
    const shopName = seller?.shopName || order.seller?.shopName || t("seller");

    return ReactDOM.createPortal(
        <div className="order-rating-modal-overlay" onClick={onClose}>
            <div className="order-rating-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t("evaluate_experience") || "Evaluate your experience"}</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="modal-body">
                    <div className="order-number-section">
                        <span className="order-number-text">
                            {t("order_number") || "Order Number"}: {order.orderNumber}
                        </span>
                    </div>

                    <hr className="fine-line" />

                    <div className="rating-section seller-rating-section">
                        <h3 className="section-title">{t("rate_seller") || "Rate Seller"}</h3>
                        <div className="seller-info-group">
                            <div className="seller-profile">
                                <img
                                    src={sellerImage}
                                    alt={shopName}
                                    className="seller-image"
                                    onError={(e) => { e.target.src = "/placeholder.png" }}
                                />
                                <span className="shop-name">{shopName}</span>
                            </div>
                            <div className="seller-stars">
                                <StarRating rating={sellerRating} onRate={setSellerRating} />
                            </div>
                        </div>
                    </div>

                    <hr className="fine-line" />

                    <div className="rating-section products-rating-section">
                        <h3 className="section-title">{t("rate_products") || "Rate Products"}</h3>
                        {order.items.map(item => {
                            const product = productArray.find(p => p._id === item.productId);
                            const ratingData = productRatings[item.productId];
                            const prodImage = product?.images?.[0]?.url || product?.image || "/placeholder.png";

                            return (
                                <div key={item.productId} className="product-rate-item">
                                    <div className="product-info-group">
                                        <div className="product-profile">
                                            <img
                                                src={prodImage}
                                                alt={product?.name}
                                                className="product-image"
                                                onError={(e) => { e.target.src = "/placeholder.png" }}
                                            />
                                            <span className="product-name">{product?.name || item.name}</span>
                                        </div>
                                    </div>
                                    <div className="product-stars-comment">
                                        <div className="stars-wrapper">
                                            <StarRating
                                                rating={ratingData.rating}
                                                onRate={(val) => handleProductRatingChange(item.productId, 'rating', val)}
                                            />
                                        </div>
                                        <textarea
                                            className="comment-box"
                                            placeholder={t("add_comment_placeholder") || "Add a comment (optional)..."}
                                            value={ratingData.comment}
                                            onChange={(e) => handleProductRatingChange(item.productId, 'comment', e.target.value)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={submitting}>
                        {t("cancel") || "Cancel"}
                    </button>
                    <button className="btn-submit" onClick={submitRatings} disabled={submitting}>
                        {submitting ? t("submitting") || "Submitting..." : t("submit_rating") || "Submit Rating"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
