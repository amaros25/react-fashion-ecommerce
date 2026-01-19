const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Fetch all sellers from the API
 * @returns {Promise<Object>} - Object with success status, data (sellerMap), and errorKey
 */
export const fetchSellersByIds = async (sellerIds) => {
    try {
        console.log("sellerIds", sellerIds);
        let url = `${apiUrl}/users/getSellerByIds?ids=${sellerIds.join(",")}`;
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
        const res = await fetch(`${apiUrl}/users/public-seller/${sellerId}`, {
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
        console.log("createOrder orderData: ", orderData);
        console.log("createOrder token: ", token);
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
 * @param {string} user - User ID
 * @param {string} token - Authentication token
 * @param {number} orderStatus - Initial order status
 * @param {boolean} isDelivery - Delivery or pickup
 * @returns {Promise<Object>} - Object with success status and errorKey
 */
/**
 * Create multiple orders (one per seller)
 */
export const createMultipleOrders = async (groupedCart, user_data, userId, token, orderStatus, isDelivery = true) => {
    try {
        if (!user_data || !token) {
            return { success: false, errorKey: "error_missing_user_or_token" };
        }

        if (!user_data.phone) {
            return { success: false, errorKey: "error_missing_phone" };
        }

        if (isDelivery) {
            if (!user_data.address) {
                return { success: false, errorKey: "error_missing_address" };
            }
            if (user_data.city === null || user_data.city === undefined) {
                return { success: false, errorKey: "error_missing_city" };
            }
        }

        const selectedAddress = {
            phone: user_data.phone || "",
            ...(isDelivery && {
                address: user_data.address || "",
                city: user_data.city || 0,
                subCity: user_data.subCity || 0
            })
        };

        for (const [sellerId, items] of Object.entries(groupedCart)) {
            // HIER WIRD DIE VARIANT ID HINZUGEFÜGT
            const formattedItems = items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId, // <--- WICHTIG: Muss aus dem Cart-Item kommen
                color: item.color,
                size: item.size,
                quantity: item.quantity,
            }));
            const orderData = {
                userId,
                sellerId,
                items: formattedItems, // Enthält jetzt die variantId
                status: [{ update: orderStatus, date: new Date() }],
                notes: "",
                paymentMethod: "",
                is_delivery: isDelivery,
                selectedAddress,
            };
            const result = await createOrder(orderData, token);
            if (!result.success) {
                return result; // Bricht ab, wenn eine Bestellung fehlschlägt
            }
        }
        return { success: true };
    } catch (err) {
        console.error("Error creating multiple orders:", err);
        return { success: false, errorKey: "server_error" };
    }
};
