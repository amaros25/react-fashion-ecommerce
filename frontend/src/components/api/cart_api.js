import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Fetch all sellers from the API by their IDs
 */
export const fetchSellersByIds = async (sellerIds, token) => {
    if (!sellerIds || sellerIds.length === 0) return [];

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const url = `${BASE_URL}/users/getSellerByIds?ids=${sellerIds.join(",")}`;
        const response = await axios.get(url, config);
        return response.data;
    } catch (error) {
        console.error("Error fetching sellers by IDs:", error);
        throw error;
    }
};

/**
 * Fetch a single seller's public profile
 */
export const fetchPublicSeller = async (sellerId, token) => {
    if (!sellerId) throw new Error("missing_seller_id");

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const response = await axios.get(`${BASE_URL}/users/public-seller/${sellerId}`, config);
        return response.data;
    } catch (error) {
        console.error("Error fetching public seller:", error);
        throw error;
    }
};
