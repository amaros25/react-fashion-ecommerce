import { useLayoutEffect, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigationType } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaRegStar, FaStarHalfAlt, FaMapMarkerAlt } from 'react-icons/fa';
import ProductCard from '../product_card/product_card';
import Pagination from '../home/pagination';
import LoadingSpinner from '../utils/loading_spinner';
import './shop_page.css';
import { cities, citiesData } from '../utils/const/cities';

import { useUserProfileManager } from "../api_managers/userProfileHookManager.js";
import { useSellerProductFetchManager } from '../api_managers/useSellerProductFetchManager';
import * as userHooks from '../api_hooks/user_hooks';

const ShopPage = () => {
    const { shopSlug } = useParams();
    console.log("ShopPage shopSlug:", shopSlug);

    const navType = useNavigationType();
    const { t } = useTranslation();
    const token = localStorage.getItem("token");


    console.log("ShopPage decodedShopName:", shopSlug);
    // 1. Manager: Findet den User anhand des shopName (via dein angepasstes Backend)
    const {
        user: seller,
        loading: sellerLoading,
        error: sellerError
    } = useUserProfileManager(shopSlug, token)

    // 2. Manager: Lädt die Produkte des Sellers
    // WICHTIG: Er nutzt die seller?.id, die erst nach dem ersten Manager-Call bekannt ist
    const {
        products,
        totalPages,
        isLoading: productsLoading,
        currentPage: page,
        handlePageChange
    } = useSellerProductFetchManager(seller?.id, token, 1);

    const loading = sellerLoading || productsLoading;

    const locationInfo = useMemo(() => {
        // 1. Prüfen, ob seller überhaupt da ist
        if (!seller) return { cityName: "", subCityName: "" };

        try {
            // 2. Prüfen, ob city und subCity existieren (können 0 sein, daher !== undefined)
            const cityKey = seller.city;
            const subCityKey = seller.subCity;

            const hasCity = cityKey !== undefined && cityKey !== null;
            const hasSubCity = subCityKey !== undefined && subCityKey !== null;

            if (!hasCity) return { cityName: "", subCityName: "" };

            // 3. Namen aus deinen Daten-Objekten mappen
            const cName = cities[cityKey] || "";

            // subCity nur suchen, wenn auch der Key da ist
            const sName = (hasSubCity && citiesData[cName])
                ? citiesData[cName][subCityKey] || ""
                : "";

            return { cityName: cName, subCityName: sName };
        } catch (error) {
            console.error("Address error in ShopPage:", error);
            return { cityName: "", subCityName: "" };
        }
    }, [seller]);


    const averageRating = seller?.averageRating || 0;
    const reviewCount = seller?.reviewCount || 0;
    const viewsCount = seller?.views || 0;

    const { mutate: incrementViews } = userHooks.useIncrementViews();

    // 3. View Increment Logic (Throttled once per day)
    useEffect(() => {
        if (!seller?.id) return;

        const storageKey = `shop_view_${seller.id}`;
        const lastView = localStorage.getItem(storageKey);
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!lastView || (now - parseInt(lastView, 10) > oneDay)) {
            incrementViews(seller.id);
            localStorage.setItem(storageKey, now.toString());
        }
    }, [seller?.id, incrementViews]);

    const handleProductClick = useCallback((product) => {
        window.localStorage.setItem('scrollPosition', window.scrollY);
    }, []);

    useLayoutEffect(() => {
        if (!loading) {
            if (navType === 'POP') {
                const savedPosition = window.localStorage.getItem('scrollPosition');
                if (savedPosition) window.scrollTo(0, parseInt(savedPosition, 10));
            } else {
                window.scrollTo(0, 0);
            }
        }
    }, [loading, navType]);

    if (sellerError) {
        return (
            <div className="shop-error-container">
                <p>{t('shop_not_found')}</p>
            </div>
        );
    };

    return (
        <div className="shop-page-container">

            <header className="shop-hero"
                style={{
                    backgroundImage: seller?.imageUrl ? `url(${seller.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                <div className="shop-hero-overlay"></div>

                <div className="shop-hero-content">
                    <h1 className="shop-title">{seller?.shopName || "SELLER SHOP"}</h1>
                </div>

                <div className="shop-info-bottom-right">
                    <div className="info-glass-block">
                        <span className="shop-owner">
                            {t('cart_page.curated_by')} {seller?.firstName} {seller?.lastName}
                        </span>

                        <span className="shop-location">
                            <FaMapMarkerAlt className="icon" />
                            {locationInfo.subCityName && locationInfo.cityName
                                ? `${locationInfo.subCityName}, ${locationInfo.cityName}`
                                : t('location_not_available')}
                        </span>

                        <div className="shop-rating-display">
                            <div className="rating-row">
                                <div className="stars-static">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const diff = averageRating - (star - 1);
                                        return (
                                            <span key={star}>
                                                {diff >= 1 ? <FaStar className="star filled" size={12} /> :
                                                    diff >= 0.5 ? <FaStarHalfAlt className="star filled" size={12} /> :
                                                        <FaRegStar className="star empty" size={12} />}
                                            </span>
                                        );
                                    })}
                                </div>
                                <span className="review-count">({reviewCount})</span>
                            </div>
                            <div className="views-row">
                                <span className="views-text">{viewsCount} {t('shop.views') || 'Views'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <section className="shop-collection">
                <div className="collection-header">
                    <h2>{t('cart_page.latest_collection')}</h2>
                    {/* <span className="collection-count">{totalItems} {t('cart_page.items')}</span> */}
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
                                <p>{t('no_products_found')}</p>
                            </div>
                        )}
                    </div>
                    {!loading && products.length > 0 && totalPages > 1 && (
                        <div className="shop-pagination">
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};


export default ShopPage;
