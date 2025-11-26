import React, { useState } from "react";
import "./product_info_header.css";
import { FaStar, FaRegStar } from "react-icons/fa";
import { toast } from "react-toastify";

function ProductInfoHeader({ product, userId }) {
    const apiUrl = process.env.REACT_APP_API_URL;

    // Lokaler State für Reviews
    const [reviews, setReviews] = useState(product.reviews || []);
    const [hoverRating, setHoverRating] = useState(0);
    const [userRating, setUserRating] = useState(
        reviews.find(r => r.user.toString() === userId)?.rating || 0
    );

    // Filter nur Reviews mit rating > 0
    const ratingsWithValue = reviews.filter(r => r.rating > 0);
    const reviewCount = ratingsWithValue.length;

    const averageRating =
        ratingsWithValue.length > 0
            ? ratingsWithValue.reduce((sum, r) => sum + r.rating, 0) / ratingsWithValue.length
            : 0;

    const handleRating = async (value) => {
        // Prüfen, ob User schon bewertet hat
        const hasRated = reviews.some(r => r.user.toString() === userId && r.rating > 0);
        if (hasRated) {
            toast.error("You have already rated this product");
            return;
        }

        setUserRating(value); // sofort für UI

        try {
            const res = await fetch(`${apiUrl}/products/${product._id}/rate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, rating: value, comment: "" }),
            });
            const data = await res.json();

            if (data?.message === "success") {
                toast.success("Review added successfully");

                // Lokale Reviews aktualisieren, damit Sterne sofort angezeigt werden
                setReviews(prev => [...prev, { user: userId, rating: value, comment: "" }]);
            } else {
                toast.error(data?.message || "Failed to add review");
            }
        } catch (err) {
            toast.error("Failed to add review");
            console.error(err);
        }
    };

    return (
        <>
            <div className="product-header-row">
                <h1 className="product-title-header-info">{product.name}</h1>
            </div>
            <div className="product-price-rating-row">
                <span className="product-price">{product.price} DT</span>
                <div className="product-rating-container">
                    <div className="product-rating">
                        {[1, 2, 3, 4, 5].map((value) => {
                            const StarIcon = value <= averageRating ? FaStar : FaRegStar;
                            return (
                                <label key={value}>
                                    <input type="radio" name="rating" value={value} style={{ display: "none" }} />
                                    <StarIcon
                                        className="star"
                                        size={22}
                                        onMouseEnter={() => setHoverRating(value)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => handleRating(value)}
                                    />
                                </label>
                            );
                        })}
                    </div>
                    <span className="review-count">({reviewCount})</span>
                </div>
            </div>
        </>
    );
}

export default ProductInfoHeader;
