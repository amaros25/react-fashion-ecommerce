import React, { useState } from "react";
import "./product_info_header.css";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { BsBookmarkHeart } from "react-icons/bs";
import { BsBookmarkHeartFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function ProductInfoHeader({ product, userId }) {
    const { t, i18n } = useTranslation();

    const reviewCount = product.reviewCount || 0;
    const averageRating = Number(product.avgRating) || 0;

    const savedProductsKey = `saved_products_${userId}`;

    const getSavedProducts = () => {
        if (!userId) return [];
        const saved = localStorage.getItem(savedProductsKey);
        return saved ? JSON.parse(saved) : [];
    };
    const [isProductSaved, setIsProductSaved] = useState(getSavedProducts().includes(product.id));
    const toggleSavedProduct = () => {
        if (!userId) {
            toast.info(t("product_page.login_to_save"));
            return;
        }

        const savedProducts = getSavedProducts();
        const isCurrentlySaved = savedProducts.includes(product.id);

        let updatedProducts;
        if (isCurrentlySaved) {
            updatedProducts = savedProducts.filter(id => id !== product.id);
            toast.info(t("product_page.remove_from_saved"));
        } else {
            updatedProducts = [...savedProducts, product.id];
            toast.success(t("product_page.add_to_saved"));
        }

        localStorage.setItem(savedProductsKey, JSON.stringify(updatedProducts));
        setIsProductSaved(!isCurrentlySaved);
    };

    const calculateTotalStock = (product) => {
        if (!product || !Array.isArray(product.variants)) return 0;
        return product.variants.reduce((total, v) => total + (v.stock || 0), 0);
    };


    const getStateInfo = (product) => {
        const currentState = product.currentState;
        if (calculateTotalStock(product) === 0) {
            return { label: t("product_state.out_of_stock"), class: "state-out-of-stock" };
        }
        switch (currentState) {
            case 0: return { label: t("product_state.pending"), class: "state-pending" };
            case 1: return { label: t("product_state.active"), class: "state-active" };
            case 2: return { label: t("product_state.blocked"), class: "state-blocked" };
            case 3: return { label: t("product_state.deleted"), class: "state-deleted" };
            default: return { label: t("product_state.unknown"), class: "state-unknown" };
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
                    <span className={`current-state-badge ${getStateInfo(product).class}`}>
                        {getStateInfo(product).label}
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
                            <span className="product-price-strikethrough">
                                {Number(product.price).toFixed(2)} {t("price_suf")}
                            </span>
                            <span className="product-price-header-info">
                                {(Number(product.price) * (1 - Number(product.discountedPercent) / 100)).toFixed(2)} {t("price_suf")}
                            </span>
                        </>
                    ) : (
                        <span className="product-price-header-info">{Number(product.price).toFixed(2)} {t("price_suf")}</span>
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
