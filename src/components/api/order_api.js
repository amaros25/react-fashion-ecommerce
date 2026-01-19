import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Fetch orders for a specific user using Axios.
 * English comments as requested.
 */
export const fetchUserOrders = async ({ userId, token, page, limit }) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        // Axios handles query parameters easily
        const response = await axios.get(
            `${BASE_URL}/orders/user/${userId}?page=${page}&limit=${limit}`,
            config
        );

        const data = response.data;

        console.log("**Data: ", data);
        return {
            orders: data.orders || [],
            totalOrders: data.totalOrders || 0,
            totalPages: data.totalPages || 1,
        };

    } catch (error) {
        // Handle 404 as a special case to return empty state
        if (error.response && error.response.status === 404) {
            return { orders: [], totalOrders: 0, totalPages: 1 };
        }

        // Rethrow other errors for the UI/TanStack Query to handle
        console.error("Error fetching user orders:", error);
        throw new Error("fetch_orders_failed");
    }
};

/**
 * Update the status of an order using Axios.
 */
export const updateOrderStatus = async ({ orderId, newStatus, token }) => {
    console.log("updateOrderStatus: orderId: ", orderId);
    console.log("updateOrderStatus: newStatus: ", newStatus);
    console.log("updateOrderStatus: token: ", token);
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        // Axios automatically stringifies the body to JSON
        const response = await axios.put(
            `${BASE_URL}/orders/${orderId}/status`,
            { status: newStatus },
            config
        );

        return response.data;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw new Error("update_order_status_failed");
    }
};


export const getSellerOrders = async (sellerId, params, token) => {
    const response = await axios.get(`${BASE_URL}/orders/seller/${sellerId}`, {
        params: params,
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
