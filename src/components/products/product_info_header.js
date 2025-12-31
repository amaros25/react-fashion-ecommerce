import React, { useState } from "react";
import "./product_info_header.css";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { BsBookmarkHeart } from "react-icons/bs";
import { BsBookmarkHeartFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function ProductInfoHeader({ product, userId }) {
    const { t, i18n } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;
    // Reviews : function used to get the reviews of a product
    const reviews = product.reviews || [];
    // Filter only reviews with rating > 0
    const ratingsWithValue = reviews.filter(r => r.rating > 0);
    const reviewCount = ratingsWithValue.length;
    const savedProductsKey = `saved_products_${userId}`;

    // Get saved products : function used to get the saved products list from the local storage
    const getSavedProducts = () => {
        const saved = localStorage.getItem(savedProductsKey);
        console.log("saved products:", saved);
        return saved ? JSON.parse(saved) : [];
    };

    // Toggle saved product : function used to add or remove a product from the saved products list
    const toggleSavedProduct = () => {
        const savedProducts = getSavedProducts();
        const isProductSaved = savedProducts.includes(product._id);
        if (!userId) {
            toast.info(t("product_page.login_to_save"));
            return;
        }
        if (isProductSaved) {
            // Product remove from saved products list
            const updatedProducts = savedProducts.filter(id => id !== product._id);
            localStorage.setItem(savedProductsKey, JSON.stringify(updatedProducts));
            setIsProductSaved(false);
            toast.info(t("product_page.remove_from_saved"));
        } else {
            // Product add to saved products list
            savedProducts.push(product._id);
            localStorage.setItem(savedProductsKey, JSON.stringify(savedProducts));
            setIsProductSaved(true);
            toast.success(t("product_page.add_to_saved"));
        }
    };
    const [isProductSaved, setIsProductSaved] = useState(getSavedProducts().includes(product._id));

    // Calculate average rating : function used to calculate the average rating of a product
    const averageRating =
        ratingsWithValue.length > 0
            ? ratingsWithValue.reduce((sum, r) => sum + r.rating, 0) / ratingsWithValue.length
            : 0;


    const getStateLabel = (state) => {
        switch (state) {
            case 0: return t("product_state.pending");
            case 1: return t("product_state.active");
            case 2: return t("product_state.blocked");
            case 3: return t("product_state.deleted");
            default: return t("product_state.unknown");
        }
    };

    const getStateClass = (state) => {
        switch (state) {
            case 0: return "state-pending";
            case 1: return "state-active";
            case 2: return "state-blocked";
            case 3: return "state-deleted";
            default: return "state-unknown";
        }
    };
    return (
        <>
            <div className="product-header-column">
                <div className="product-header-row">
                    <h1 className="product-title-header-info">{product.name}</h1>
                    <div onClick={toggleSavedProduct} className="save-product-icon">
                        {isProductSaved ? (
                            <BsBookmarkHeartFill className="star-icon" size={22} /> // Saved
                        ) : (
                            <BsBookmarkHeart className="star-icon" size={22} /> // Not saved
                        )}
                    </div>

                </div>
                <div className="product-badges">
                    <span className={`current-state-badge ${getStateClass(product.states?.[product.states.length - 1]?.state)}`}>
                        {getStateLabel(product.states?.[product.states.length - 1]?.state)}
                    </span>
                    <span className="product-number-badge">
                        {product.productNumber}
                    </span>
                </div>
            </div>
            <div className="product-price-rating-row">
                <div className="product-price-container">
                    {product.discountedPercent > 0 ? (
                        <>
                            <span className="product-price-strikethrough">{product.price} {t("price_suf")}</span>
                            <span className="product-price-header-info">
                                {(product.price * (1 - product.discountedPercent / 100)).toFixed(0)} {t("price_suf")}
                            </span>
                        </>
                    ) : (
                        <span className="product-price-header-info">{product.price} {t("price_suf")}</span>
                    )}
                </div>
                <div className="product-rating-container">
                    <div className="product-rating">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const diff = averageRating - (star - 1);
                            let StarIcon;
                            if (diff >= 1) {
                                StarIcon = FaStar;
                            } else if (diff >= 0.5) {
                                StarIcon = FaStarHalfAlt;
                            } else {
                                StarIcon = FaRegStar;
                            }
                            return (
                                <StarIcon
                                    key={star}
                                    className="star"
                                    size={22}
                                    color={diff >= 0.5 ? "#ffc107" : "#e4e5e9"}
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
