const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Fetch all sellers from the API
 * @returns {Promise<Object>} - Object with seller IDs as keys and seller data as values
 */
export const fetchSellersByIds = async (sellerIds) => {
    try {
        console.log("fetchSellersByIds sellerIds", sellerIds);
        let url = `${apiUrl}/sellers/getByIds?ids=${sellerIds.join(",")}`;
        console.log("fetchSellersByIds url", url);
        const res = await fetch(url);

        const data = await res.json();
        console.log("fetchSellersByIds data", data);
        const sellerMap = data.reduce((acc, seller) => {
            acc[seller._id] = seller;
            return acc;
        }, {});
        return sellerMap;
    } catch (err) {
        console.error("Error fetching sellers:", err);
        throw err;
    }
};

/**
 * Fetch all sellers from the API
 * @returns {Promise<Object>} - Object with seller IDs as keys and seller data as values
 */

export const fetchSeller = async (sellerId, token) => {
    if (!sellerId || !token) return;
    try {
        const res = await fetch(`${apiUrl}/sellers/${sellerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch seller: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error('Error fetching seller:', err);
    }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data including userId, sellerId, items, totalPrice, etc.
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Created order response
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

        if (!res.ok) {
            throw new Error(`Error creating order: ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        console.error("Error creating order:", err);
        throw err;
    }
};

/**
 * Create multiple orders (one per seller)
 * @param {Object} groupedCart - Cart items grouped by seller ID
 * @param {string} userId - User ID
 * @param {string} token - Authentication token
 * @param {number} orderStatus - Initial order status (integer)
 * @param {boolean} isDelivery - Whether the order is for delivery or pickup
 * @returns {Promise<void>}
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

            await createOrder(orderData, token);
        }
    } catch (err) {
        console.error("Error creating multiple orders:", err);
        throw err;
    }
};
