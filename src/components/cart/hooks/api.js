const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Fetch all sellers from the API
 * @returns {Promise<Object>} - Object with success status, data (sellerMap), and errorKey
 */
export const fetchSellersByIds = async (sellerIds) => {
    try {
        let url = `${apiUrl}/sellers/getByIds?ids=${sellerIds.join(",")}`;
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
            const sellerMap = data.reduce((acc, seller) => {
                acc[seller._id] = seller;
                return acc;
            }, {});
            return { success: true, data: sellerMap };
        } else {
            return { success: false, errorKey: data.message || "server_error" };
        }
    } catch (err) {
        console.error("Error fetching sellers:", err);
        return { success: false, errorKey: "server_error" };
    }
};

/**
 * Fetch a single seller
 * @returns {Promise<Object>} - Object with success status, data (seller), and errorKey
 */
export const fetchSeller = async (sellerId, token) => {
    if (!sellerId || !token) return { success: false, errorKey: "missing_data" };
    try {
        const res = await fetch(`${apiUrl}/sellers/${sellerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
            return { success: true, data };
        } else {
            return { success: false, errorKey: data.message || "server_error" };
        }
    } catch (err) {
        console.error('Error fetching seller:', err);
        return { success: false, errorKey: "server_error" };
    }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Object with success status, data (order), and errorKey
 */
export const createOrder = async (orderData, token) => {
    try {
        const res = await fetch(`${apiUrl}/orders/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        const data = await res.json();
        if (res.ok) {
            return { success: true, data };
        } else {
            return { success: false, errorKey: data.message || "server_error" };
        }
    } catch (err) {
        console.error("Error creating order:", err);
        return { success: false, errorKey: "server_error" };
    }
};

/**
 * Create multiple orders (one per seller)
 * @param {Object} groupedCart - Cart items grouped by seller ID
 * @param {string} userId - User ID
 * @param {string} token - Authentication token
 * @param {number} orderStatus - Initial order status
 * @param {boolean} isDelivery - Delivery or pickup
 * @returns {Promise<Object>} - Object with success status and errorKey
 */
export const createMultipleOrders = async (groupedCart, userId, token, orderStatus, isDelivery = true) => {
    try {
        for (const [sellerId, items] of Object.entries(groupedCart)) {
            const formattedItems = items.map((item) => ({
                productId: item.productId,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
            }));

            const shippingCost = isDelivery ? items.reduce((sum, i) => sum + (i.delprice || 0), 0) : 0;
            const totalPrice =
                items.reduce((sum, i) => sum + i.price * i.quantity, 0) + shippingCost;

            const orderData = {
                userId,
                sellerId,
                items: formattedItems,
                totalPrice,
                status: [{ update: orderStatus, date: new Date() }],
                notes: "",
                paymentMethod: "Cash on Delivery",
                is_delivery: isDelivery,
            };

            const result = await createOrder(orderData, token);
            if (!result.success) {
                return result; // Return first failure
            }
        }
        return { success: true };
    } catch (err) {
        console.error("Error creating multiple orders:", err);
        return { success: false, errorKey: "server_error" };
    }
};
