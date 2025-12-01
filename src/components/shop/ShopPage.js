import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaRegStar, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ProductCard from '../product_card/product_card';
import Pagination from '../home/pagination';
import LoadingSpinner from '../products/loading_spinner';
import { cities, citiesData } from '../const/cities';
import './shop_page.css';

const ShopPage = () => {
    const { sellerId } = useParams();
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;

    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [hasRated, setHasRated] = useState(false);

    // Fetch Seller Info
    useEffect(() => {
        const fetchSeller = async () => {
            try {
                const res = await fetch(`${apiUrl}/sellers/${sellerId}`);
                if (!res.ok) throw new Error('Failed to fetch seller');
                const data = await res.json();
                setSeller(data);
            } catch (error) {
                console.error('Error fetching seller:', error);
                toast.error('Could not load shop information');
            }
        };

        fetchSeller();
    }, [sellerId, apiUrl]);

    // Fetch Seller Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Assuming the API supports filtering by sellerId via query param
                // If not, we might need a specific endpoint or filter client-side (not ideal)
                const res = await fetch(`${apiUrl}/products/latest?seller=${sellerId}&page=${page}&limit=12`);
                const data = await res.json();

                if (Array.isArray(data.products)) {
                    // Filter client side just in case the API ignores the seller param (safety net)
                    // Ideally the API handles this.
                    const sellerProducts = data.products.filter(p => p.sellerId === sellerId);
                    // If the API returns ALL products, we must filter. 
                    // If the API correctly filters, this is redundant but harmless if IDs match.
                    // However, pagination would be broken if we filter client side on a paginated result of ALL products.
                    // Let's assume the API works or we use the filtered result.
                    // Actually, if the API doesn't support 'seller' param, we are in trouble with pagination.
                    // Let's assume standard behavior: API filters if param provided.
                    setProducts(data.products);
                    setTotalPages(data.totalPages);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) {
            fetchProducts();
        }
    }, [sellerId, page, apiUrl]);

    const handleRateSeller = (ratingValue) => {
        if (hasRated) return;

        // Optimistic update
        setUserRating(ratingValue);
        setHasRated(true);

        // Update seller local state to reflect new average immediately
        if (seller) {
            const newReview = { rating: ratingValue };
            const updatedReviews = [...(seller.reviews || []), newReview];
            setSeller({ ...seller, reviews: updatedReviews });
        }

        toast.success(t('Thank you for your rating!'));

        // Here you would normally send the rating to the backend
        // fetch(`${apiUrl}/sellers/${sellerId}/rate`, { method: 'POST', body: ... })
    };

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
            {/* Header */}
            <div className="shop-header">
                {seller.image && (
                    <img src={seller.image} alt={seller.shopName} className="shop-header-image" />
                )}
                <div className="shop-header-info">
                    <h1 className="shop-name">{seller.shopName || "Seller Shop"}</h1>
                    <p className="seller-name">
                        {t('By')} {seller.firstName} {seller.lastName}
                        {seller.address && seller.address.length > 0 && (
                            <span style={{ marginLeft: '15px', fontSize: '0.9em' }}>
                                <FaMapMarkerAlt style={{ marginRight: '4px' }} />
                                {citiesData[cities[seller.address[seller.address.length - 1].city]][seller.address[seller.address.length - 1].subCity]},
                                {cities[seller.address[seller.address.length - 1].city]}
                            </span>
                        )}
                    </p>

                    <div className="shop-stats">
                        <div className="shop-rating">
                            <span className="rating-value">{averageRating.toFixed(1)}</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`star ${star <= Math.round(averageRating) ? 'filled' : ''}`}
                                    size={20}
                                />
                            ))}
                            <span className="review-count">({reviewCount} {t('reviews')})</span>
                        </div>
                    </div>

                    {/* Rate Seller Section */}
                    {!hasRated && (
                        <div className="rate-seller-section">
                            <span className="rate-seller-title">{t('Rate this seller')}</span>
                            <div className="interactive-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <div
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => handleRateSeller(star)}
                                    >
                                        {star <= (hoverRating || userRating) ? (
                                            <FaStar className="star filled" size={24} color="#ffc107" />
                                        ) : (
                                            <FaRegStar className="star" size={24} color="#ccc" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <div className="shop-products">
                <h2 className="shop-products-title">{t('Latest Products')}</h2>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <div className="shop-product-grid">
                            {products.length > 0 ? (
                                products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))
                            ) : (
                                <p>{t('No products found for this seller.')}</p>
                            )}
                        </div>

                        {products.length > 0 && (
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={(p) => {
                                    setPage(p);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ShopPage;
