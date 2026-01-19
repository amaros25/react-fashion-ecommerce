import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Submit a rating for a seller.
 * Uses the new single-rating endpoint.
 */
export const rateSeller = async ({ sellerId, orderId, userId, rating, comment, token }) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const response = await axios.post(
            `${BASE_URL}/api/reviews/seller`,
            { sellerId, orderId, userId, rating, comment },
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error rating seller:", error);
        throw new Error(error.response?.data?.message || "rate_seller_failed");
    }
};

/**
 * Submit a rating for a specific product.
 */
export const rateProduct = async ({ productId, userId, rating, comment, token }) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const response = await axios.post(
            `${BASE_URL}/api/reviews/product`,
            { productId, userId, rating, comment },
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error rating product:", error);
        throw new Error(error.response?.data?.message || "rate_product_failed");
    }
};