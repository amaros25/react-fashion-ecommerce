import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './css/product_rating_modal.css';
import { useProductRatingManager } from '../api_managers/useProductRatingManager';

const StarRating = ({ rating, onRate, maxStars = 5, disabled = false }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className={`pr-star-container ${disabled ? 'disabled' : ''}`}>
            {[...Array(maxStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button" key={starValue} className="pr-star-btn"
                        onClick={() => !disabled && onRate(starValue)}
                        onMouseEnter={() => !disabled && setHover(starValue)}
                        onMouseLeave={() => !disabled && setHover(0)}
                    >
                        {starValue <= (hover || rating) ?
                            <FaStar className="pr-star-icon pr-active" /> :
                            <FaRegStar className="pr-star-icon" />
                        }
                    </button>
                );
            })}
        </div>
    );
};

export default function ProductRatingModal({ order, productId, onClose, onRatingComplete }) {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId")
    const manager = useProductRatingManager(productId, userId, token, onRatingComplete);
    // Finde das Item in der Bestellung
    const itemInfo = order?.items?.find(i => i.productId === productId);

    // Das Produkt-Objekt aus dem Item (dein Log zeigt: {id: 2, name: 'Test2', images: Array(1), ...})
    const product = itemInfo?.product;

    // Logik für das Bild: Nimm das erste Element aus dem images-Array (da es direkt ein String ist)
    const productImageUrl = product?.mainImage || "/placeholder.png";

    const handleSubmit = async () => {
        if (rating === 0) return toast.error(t("please_select_rating"));

        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    productId,
                    orderId: order.id,
                    userId: localStorage.getItem("userId"),
                    rating,
                    comment
                })
            });

            if (!response.ok) throw new Error();
            toast.success(t("rating_submitted_success"));
            onRatingComplete();
        } catch (error) {
            toast.error(t("rating_submit_error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!itemInfo) return null;

    return ReactDOM.createPortal(
        <div className="pr-modal-overlay" onClick={onClose}>
            <div className="pr-modal-content" onClick={e => e.stopPropagation()}>
                <div className="pr-modal-header">
                    <h2>{t("rate_product")}</h2>
                    <button className="pr-close-btn" onClick={onClose}><FaTimes /></button>
                </div>

                <div className="pr-modal-body">
                    <div className="pr-product-info">
                        <img
                            src={productImageUrl}
                            className="pr-product-img"
                            alt={product?.name || itemInfo?.name}
                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                        />
                        <span className="pr-product-name">{product?.name || itemInfo?.name}</span>
                    </div>

                    <StarRating rating={rating} onRate={setRating} disabled={isSubmitting} />

                    <textarea
                        className="pr-comment-input"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t("add_comment_placeholder")}
                    />
                </div>

                <div className="pr-modal-footer">
                    <button className="pr-submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? t("submitting") : t("submit_rating")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}