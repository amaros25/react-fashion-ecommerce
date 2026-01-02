import { useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigationType } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaRegStar, FaStarHalfAlt, FaMapMarkerAlt } from 'react-icons/fa';
import ProductCard from '../product_card/product_card';
import Pagination from '../home/pagination';
import LoadingSpinner from '../utils/loading_spinner';
import { useShopData } from './hooks/useShopData';
import './shop_page.css';
import { cities, citiesData } from '../utils/const/cities';
import { toast } from "react-toastify";

const ShopPage = () => {
    const { sellerId } = useParams();
    const navType = useNavigationType();
    const { t } = useTranslation();
    let cityName = "";
    let subCityName = "";

    const {
        seller,
        products,
        loading,
        page,
        setPage,
        totalPages,
        totalItems,
        error
    } = useShopData(sellerId);
    const averageRating = seller?.averageRating || 0;
    const reviewCount = seller?.reviewCount || 0;

    const handleProductClick = useCallback((product) => {
        window.localStorage.setItem('scrollPosition', window.scrollY);
    }, []);

    useLayoutEffect(() => {
        if (!loading) {
            if (navType === 'POP') {
                const savedPosition = window.localStorage.getItem('scrollPosition');
                if (savedPosition) {
                    window.scrollTo(0, parseInt(savedPosition, 10));
                }
            } else {
                window.scrollTo(0, 0);
            }
        }
    }, [loading, navType]);

    if (error) {
        return (
            <div className="shop-error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>{t('Retry')}</button>
            </div>
        );
    }

    const getCityName = () => {
        try {
            if (seller && Array.isArray(seller.address) && seller.address.length > 0) {
                const lastAddress = seller.address[seller.address.length - 1];
                cityName = cities[lastAddress.city];
                subCityName = citiesData[cities[lastAddress.city]]?.[lastAddress.subCity] || "";
            } else if (seller && seller.address && typeof seller.address === "object") {
                const address = seller.address;
                cityName = cities[address.city];
                subCityName = citiesData[cities[address.city]]?.[address.subCity] || "";
            } else {
                console.log("No valid address found.");
            }
        } catch (error) {
            console.error("Error getting city name:", error);
            toast.error(t('Failed to get city name'));
        }
    };

    getCityName();

    return (
        <div className="shop-page-container">

            <header className="shop-hero">
                <div className="shop-hero-content">
                    <h1 className="shop-title">{seller?.shopName || "SELLER SHOP"}</h1>
                    <div className="shop-meta">
                        <span className="shop-owner">
                            {t('cart_page.curated_by')} {seller?.firstName} {seller?.lastName}
                        </span>

                        <span className="shop-location">
                            <FaMapMarkerAlt className="icon" />
                            {subCityName}, {cityName}
                        </span>
                    </div>
                    <div className="shop-rating-display">
                        <div className="stars-static">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const diff = averageRating - (star - 1);
                                if (diff >= 1) {
                                    return <FaStar key={star} className="star filled" size={18} />;
                                } else if (diff >= 0.5) {
                                    return <FaStarHalfAlt key={star} className="star filled" size={18} />;
                                } else {
                                    return <FaRegStar key={star} className="star empty" size={18} />;
                                }
                            })}
                        </div>
                        <span className="rating-text">
                            ({reviewCount} {t('product_page.reviews')})
                        </span>
                    </div>
                </div>
            </header>
            <section className="shop-collection">
                <div className="collection-header">
                    <h2>{t('cart_page.latest_collection')}</h2>
                    <span className="collection-count">{totalItems} {t('cart_page.items')}</span>
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
