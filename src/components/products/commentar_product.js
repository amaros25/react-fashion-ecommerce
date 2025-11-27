import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaStar, FaRegStar } from 'react-icons/fa';
import './commentar_product.css';
import { toast } from 'react-toastify';

const CommentProduct = ({ product, onReviewAdded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const apiUrl = process.env.REACT_APP_API_URL;
    const userId = localStorage.getItem("userId");

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return toast.error("Please select a rating");

        try {
            const res = await fetch(`${apiUrl}/products/${product._id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ userId, rating, comment })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Review added successfully");
                setComment('');
                setRating(0);
                if (onReviewAdded) onReviewAdded();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to add review");
        }
    };

    return (
        <div className="comment-product-container">
            <div className="comment-header" onClick={toggleOpen}>
                <h3>Reviews ({product.reviews ? product.reviews.length : 0})</h3>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {isOpen && (
                <div className="comment-body">
                    {/* Review List */}
                    <div className="review-list">
                        {product.reviews && product.reviews.length > 0 ? (
                            [...product.reviews]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((review, index) => (
                                    <div key={index} className="review-card">
                                        <div className="review-header">
                                            <span className="review-user">
                                                {review.user && review.user.firstName ? `${review.user.firstName} ${review.user.lastName}` : "User"}
                                            </span>
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString()} {new Date(review.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="review-rating">
                                            {[...Array(5)].map((star, i) => (
                                                <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} size={15} />
                                            ))}
                                        </div>
                                        <p className="review-text">{review.comment}</p>
                                    </div>
                                ))
                        ) : (
                            <p>No reviews yet.</p>
                        )}
                    </div>

                    {/* Add Review Form */}
                    {userId && !product.reviews.some(r => (r.user._id || r.user) === userId) && (
                        <form onSubmit={handleSubmit} className="add-review-form">
                            <h4>Write a Review</h4>
                            <div className="star-rating">
                                {[...Array(5)].map((star, index) => {
                                    const ratingValue = index + 1;
                                    const StarIcon = ratingValue <= (hover || rating) ? FaStar : FaRegStar;
                                    return (
                                        <label key={index}>
                                            <input
                                                type="radio"
                                                name="rating"
                                                value={ratingValue}
                                                onClick={() => setRating(ratingValue)}
                                            />
                                            <StarIcon
                                                className="star"
                                                color="#000"
                                                size={25}
                                                onMouseEnter={() => setHover(ratingValue)}
                                                onMouseLeave={() => setHover(0)}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your comment..."
                                required
                            />
                            <button type="submit">Submit Review</button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentProduct;
