import React, { useState, useEffect } from 'react';
import { useParams, useNavigationType } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaRegStar, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ProductCard from '../product_card/product_card';
import Pagination from '../home/pagination';
import LoadingSpinner from '../utils/loading_spinner';
import { useShopData } from './hooks/useShopData';
import './shop_page.css';
import { cities, citiesData } from '../utils/const/cities';


const ShopPage = () => {
    const { sellerId } = useParams();
    const navType = useNavigationType();
    const { t } = useTranslation();
    const userId = localStorage.getItem("userId");
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        // Scroll always to the top when the ShopPage is loaded
        window.scrollTo(0, 0);
    }, [navType]); // Empty dependency array to run only once on mount


    const handleProductClick = () => {
        console.log("handleProductClick: ", window.scrollY);
        window.localStorage.setItem('scrollPosition', window.scrollY);
    };

    const {
        seller,
        products,
        loading,
        page,
        setPage,
        totalPages,
        userRating,
        hasRated,
        handleRateSeller
    } = useShopData(sellerId, userId);

    const calculateAverageRating = () => {
        if (!seller || !seller.reviews || seller.reviews.length === 0) return 0;
        const validReviews = seller.reviews.filter(r => r.rating > 0);
        if (validReviews.length === 0) return 0;
        const sum = validReviews.reduce((acc, curr) => acc + curr.rating, 0);
        return sum / validReviews.length;
    };

    if (!seller) return <LoadingSpinner />;

    const averageRating = calculateAverageRating();
    const reviewCount = seller.reviews ? seller.reviews.filter(r => r.rating > 0).length : 0;

    return (
        <div className="shop-page-container">
            {/* Minimalist Header */}
            <header className="shop-hero">
                <div className="shop-hero-content">
                    <h1 className="shop-title">{seller.shopName || "SELLER SHOP"}</h1>

                    <div className="shop-meta">
                        <span className="shop-owner">
                            {t('Curated by')} {seller.firstName} {seller.lastName}
                        </span>
                        {seller.address && seller.address.length > 0 && (
                            <span className="shop-location">
                                <FaMapMarkerAlt className="icon" />
                                {citiesData[cities[seller.address[seller.address.length - 1].city]][seller.address[seller.address.length - 1].subCity]}, {cities[seller.address[seller.address.length - 1].city]}
                            </span>
                        )}
                    </div>

                    <div className="shop-rating-display">
                        <div className="stars-static">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`star ${star <= Math.round(averageRating) ? 'filled' : ''}`}
                                    size={14}
                                />
                            ))}
                        </div>
                        <span className="rating-text">
                            {averageRating.toFixed(1)} / 5 ({reviewCount} {t('reviews')})
                        </span>
                    </div>

                    {/* Rate Seller Section - Only if not rated and logged in */}
                    {!hasRated && userId && (
                        <div className="rate-action">
                            <span className="rate-label">{t('Rate Experience')}</span>
                            <div className="stars-interactive">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <div
                                        key={star}
                                        className="star-wrapper"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => handleRateSeller(star)}
                                    >
                                        {star <= (hoverRating || userRating) ? (
                                            <FaStar className="star filled" size={20} />
                                        ) : (
                                            <FaRegStar className="star" size={20} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {hasRated && (
                        <div className="rated-badge">
                            {t('You rated this seller')}
                        </div>
                    )}
                </div>
            </header>

            {/* Products Grid */}
            <section className="shop-collection">
                <div className="collection-header">
                    <h2>{t('LATEST COLLECTION')}</h2>
                    <span className="collection-count">{products.length} {t('Items')}</span>
                </div>

                <div className="shop-products-area" style={{ minHeight: '600px', position: 'relative' }}>
                    {loading && (
                        <div className="shop-loading-overlay">
                            <LoadingSpinner />
                        </div>
                    )}

                    <div className={`shop-grid ${loading ? 'loading' : ''}`}>
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product._id} product={product} onClick={() => handleProductClick(product)} />
                            ))
                        ) : !loading && (
                            <div className="no-products">
                                <p>{t('No products found for this seller.')}</p>
                            </div>
                        )}
                    </div>

                    {products.length > 0 && !loading && (
                        <div className="shop-pagination">
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={(p) => {
                                    setPage(p);


                                }}
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ShopPage;
