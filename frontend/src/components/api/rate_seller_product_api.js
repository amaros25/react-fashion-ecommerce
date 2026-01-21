import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;


/**
 * Sends one single request containing the seller rating and all product ratings.
 * English comments as requested.
 */
export const rate_seller_product = async ({ order, userId, token, sellerRating, productRatings }) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const ratingsArray = Object.keys(productRatings).map(productId => ({
        productId: parseInt(productId),
        rating: productRatings[productId].rating,
        comment: productRatings[productId].comment
    }));

    const payload = {
        userId,
        orderId: order.id,
        sellerRating,
        productRatings: ratingsArray
    };

    return axios.post(`${BASE_URL}/users/${order.sellerId}/rate`, payload, config)
        .then(res => res.data);
};