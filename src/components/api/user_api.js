import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Crate user 
 */
export const createUser = async ({ payload }) => {
    try {
        console.log("FINAL PAYLOAD TO SERVER:", payload);
        const res = await axios.post(`${BASE_URL}/users/create`, { ...payload });
        return res.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

/**
 * Helper to create auth config
 */
const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

/**
 * Fetch a specific user.
 */
export const fetchUser = async (userId, token) => {
    try {
        const res = await axios.get(`${BASE_URL}/users/${userId}/user`, getAuthHeaders(token));
        return res.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};


/**
 * Fetch a specific seller.
 */
export const fetchSeller = async (userId, token) => {
    try {
        const res = await axios.get(`${BASE_URL}/users/${userId}/seller`, getAuthHeaders(token));
        return res.data;
    } catch (error) {
        console.error("Error fetching seller:", error);
        throw error;
    }
};


/**
 * Update user address.
 */
export const updateAddress = async ({ userId, addressData, token }) => {
    try {
        // With Axios, you don't need JSON.stringify.
        // It also automatically sets Content-Type to application/json.
        const res = await axios.patch(
            `${BASE_URL}/users/${userId}/address`,
            { address: addressData },
            getAuthHeaders(token)
        );
        return res.data;
    } catch (error) {
        console.error("Error updating address:", error);
        throw error;
    }
};

/**
 * Update user profile image.
 */
export const updateImage = async ({ userId, imageUrl, token }) => {
    try {
        const res = await axios.put( // Often use PUT or PATCH for updates
            `${BASE_URL}/users/${userId}/updateImage`,
            { imageUrl },
            getAuthHeaders(token)
        );
        return res.data;
    } catch (error) {
        console.error("Error updating image:", error);
        throw error;
    }
};

/**
 * Update user phone number.
 */
export const updatePhone = async ({ userId, phone, token }) => {
    try {
        const res = await axios.patch(
            `${BASE_URL}/users/${userId}/phone`,
            { phone },
            getAuthHeaders(token)
        );
        return res.data;
    } catch (error) {
        console.error("Error updating phone:", error);
        throw error;
    }
};