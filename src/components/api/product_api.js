import axios from 'axios';

/**
 * API communication layer for product-related endpoints.
 * Interacts with the Express backend using the routes defined in your router.
 */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const productApi = {
    /**
     * Fetch products belonging to a specific seller.
     * @param {number} sellerId - The ID of the seller.
     * @param {object} params - Object containing page, limit, and search string.
     */
    getSellerProducts: async (sellerId, params, token) => {
        const response = await axios.get(`${API_URL}/products/seller/${sellerId}`, {
            params: params,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },
    /**
     * Create a new product including its variants.
     * Matches the 'createProduct' controller logic which uses a Sequelize transaction.
     * @param {object} productData - Should include name, price, description, category, images[], and variants[].
     */
    createProduct: async (productData, token) => {
        const response = await axios.post(`${API_URL}/products/create`, productData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    /**
     * Fetch details for a single product by its ID.
     * Includes reviews and variants as defined in the 'getProductByID' controller.
     */
    getProductDetails: async (id, token) => {

        const response = await axios.post(`${API_URL}/products/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    },

    /**
     * Fetch latest products with filtering, searching, and sorting.
     * @param {object} params - Query parameters (page, limit, category, etc.)
     */
    getLatestProducts: async (params) => {
        const response = await axios.get(`${API_URL}/products/latest`, {
            params: params,
        });
        return response.data;
    }
};