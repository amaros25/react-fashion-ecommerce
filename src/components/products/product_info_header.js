import React, { useState } from "react";
import "./product_info_header.css";
import { FaStar, FaRegStar } from "react-icons/fa";
import { toast } from "react-toastify";

function ProductInfoHeader({ product, userId }) {
    const apiUrl = process.env.REACT_APP_API_URL;

    // Lokaler State für Reviews
    const reviews = product.reviews || [];

    // Filter nur Reviews mit rating > 0
    const ratingsWithValue = reviews.filter(r => r.rating > 0);
    const reviewCount = ratingsWithValue.length;

    const averageRating =
        ratingsWithValue.length > 0
            ? ratingsWithValue.reduce((sum, r) => sum + r.rating, 0) / ratingsWithValue.length
            : 0;

    return (
        <>
            <div className="product-header-row">
                <h1 className="product-title-header-info">{product.name}</h1>
            </div>
            <div className="product-price-rating-row">
                <span className="product-price-header-info">{product.price} DT</span>
                <div className="product-rating-container">
                    <div className="product-rating">
                        {[1, 2, 3, 4, 5].map((value) => {
                            const StarIcon = value <= Math.round(averageRating) ? FaStar : FaRegStar;
                            return (
                                <StarIcon
                                    key={value}
                                    className="star"
                                    size={22}
                                    color={value <= Math.round(averageRating) ? "#ffc107" : "#e4e5e9"}
                                />
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
