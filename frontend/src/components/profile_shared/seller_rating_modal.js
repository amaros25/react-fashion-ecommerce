import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './css/seller_rating_modal.css';

const StarRating = ({ rating, onRate, maxStars = 5, disabled = false }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className={`srm-star-container ${disabled ? 'disabled' : ''}`}>
            {[...Array(maxStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button" key={starValue} className="srm-star-btn"
                        onClick={() => !disabled && onRate(starValue)}
                        onMouseEnter={() => !disabled && setHover(starValue)}
                        onMouseLeave={() => !disabled && setHover(0)}
                    >
                        {starValue <= (hover || rating) ? (
                            <FaStar className="srm-star-icon active" />
                        ) : (
                            <FaRegStar className="srm-star-icon" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default function SellerRatingModal({ order, onClose, onRatingComplete }) {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const shopName = order.seller?.shopName || t("seller");
    const sellerImage = order.seller?.imageUrl || "/placeholder.png";

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error(t("please_select_rating"));
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/seller`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sellerId: order.sellerId,
                    orderId: order.id,
                    userId: userId,
                    rating: rating,
                    comment: comment
                })
            });

            if (!response.ok) throw new Error('Failed to submit seller rating');

            toast.success(t("seller_rating_submitted_success"));
            onRatingComplete();
        } catch (error) {
            toast.error(t("rating_submit_error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="srm-overlay" onClick={onClose}>
            <div className="srm-content" onClick={e => e.stopPropagation()}>

                <div className="srm-header">
                    <h2>{t("rate_seller")}</h2>
                    <button className="srm-close-btn" onClick={onClose} disabled={isSubmitting}>
                        <FaTimes />
                    </button>
                </div>

                <div className="srm-info-section">
                    <img
                        src={sellerImage}
                        alt={shopName}
                        className="srm-seller-img"
                        onError={(e) => { e.target.src = "/placeholder.png" }}
                    />
                    <span className="srm-seller-name">{shopName}</span>
                    <p className="srm-order-ref">
                        {t("help_center.order_number")}: {order.orderNumber}
                    </p>
                </div>

                <StarRating
                    rating={rating}
                    onRate={setRating}
                    disabled={isSubmitting}
                />

                <textarea
                    className="srm-comment-input"
                    placeholder={t("seller_review_placeholder")}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                />

                <div className="srm-footer">
                    <button
                        className="srm-submit-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t("submitting") : t("submit_rating")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}