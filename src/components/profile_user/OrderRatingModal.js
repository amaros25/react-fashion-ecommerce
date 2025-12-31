import React, { useState } from 'react';
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
        sellerRating,
        setSellerRating,
        productRatings,
        handleProductRatingChange,
        submitRatings,
        submitting
    } = useOrderRating(order, onRatingComplete);

    const productArray = Array.isArray(products) ? products : Object.values(products);

    return (
        <div className="order-rating-modal-overlay" onClick={onClose}>
            <div className="order-rating-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t("rate_your_experience") || "Rate Your Experience"}</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="modal-body">
                    <p className="order-number-info">{t("order")}: {order.orderNumber}</p>

                    <div className="rating-section seller-rating">
                        <h3>{t("rate_seller") || "Rate Seller"}</h3>
                        <StarRating rating={sellerRating} onRate={setSellerRating} />
                    </div>

                    <hr />

                    <div className="rating-section products-rating">
                        <h3>{t("rate_products") || "Rate Products"}</h3>
                        {order.items.map(item => {
                            const product = productArray.find(p => p._id === item.productId);
                            const ratingData = productRatings[item.productId];

                            return (
                                <div key={item.productId} className="product-rate-item">
                                    <div className="product-info-mini">
                                        <img src={product?.images?.[0]?.url || product?.image} alt={product?.name} />
                                        <span>{product?.name || item.name}</span>
                                    </div>
                                    <StarRating
                                        rating={ratingData.rating}
                                        onRate={(val) => handleProductRatingChange(item.productId, 'rating', val)}
                                    />
                                    <textarea
                                        placeholder={t("add_comment_placeholder") || "Add a comment (optional)..."}
                                        value={ratingData.comment}
                                        onChange={(e) => handleProductRatingChange(item.productId, 'comment', e.target.value)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={submitting}>{t("cancel") || "Cancel"}</button>
                    <button className="btn-submit" onClick={submitRatings} disabled={submitting}>
                        {submitting ? t("submitting") || "Submitting..." : t("submit_rating") || "Submit Rating"}
                    </button>
                </div>
            </div>
        </div>
    );
}
