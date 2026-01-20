import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaStar, FaRegStar } from 'react-icons/fa';



import './commentar_product.css';
import { useTranslation } from "react-i18next";

const CommentProduct = ({ product, onReviewAdded }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="comment-product-container">
            <div className="comment-header" onClick={toggleOpen}>
                <h3>{t('product_page.reviews')} ({product.reviews ? product.reviews.length : 0})</h3>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {isOpen && (
                <div className="comment-body">
                    {/* Review List */}
                    <div className="review-list">
                        {product.reviews && product.reviews.length > 0 ? (
                            [...product.reviews]
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .map((review, index) => (
                                    <div key={index} className="review-card">
                                        <div className="review-header">
                                            <span className="review-user">
                                                {/* Immer "User" anzeigen, wie gewünscht */}
                                                {review.user.firstName + " " + review.user.lastName || "User"}
                                            </span>
                                            <span className="review-date">
                                                {formatDate(review.created_at)}
                                            </span>
                                        </div>
                                        <div className="review-rating-comment">
                                            {[1, 2, 3, 4, 5].map((starValue) => {
                                                const currentRating = Number(review.rating);
                                                const isFilled = starValue <= currentRating;
                                                console.log("currentRating", currentRating);
                                                console.log("isFilled", isFilled);
                                                const StarIcon = isFilled ? FaStar : FaRegStar;

                                                return (
                                                    <StarIcon
                                                        key={starValue}
                                                        size={15}
                                                        style={{
                                                            // Gefüllte Sterne gelb, leere Sterne grau oder schwarz (Umriss)
                                                            color: isFilled ? "#ffc107" : "#e4e5e9",
                                                            marginRight: "2px"
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <p className="review-text">{review.comment}</p>
                                    </div>
                                ))
                        ) : (
                            <p className="no-reviews-msg">{t('product_page.no_reviews')}</p>
                        )}
                    </div>

                    {/* Add Review Form - AKTUELL AUSKOMMENTIERT */}
                    {/* {userId && !product.reviews.some(r => (r.userId) === parseInt(userId)) && (
                        <form onSubmit={handleSubmit} className="add-review-form">
                            <h4>{t('product_page.write_review')}</h4>
                            ... Formular-Inhalt ...
                        </form>
                    )} 
                    */}
                </div>
            )}
        </div>
    );
};

export default CommentProduct;