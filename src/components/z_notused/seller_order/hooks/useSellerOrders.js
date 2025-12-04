import { useEffect, useState } from "react";

export default function useSellerOrders(userId, token) {
    const apiUrl = process.env.REACT_APP_API_URL;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1️⃣ Orders abrufen
    const fetchOrders = async () => {
        try {
            const res = await fetch(`${apiUrl}/orders?seller=${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch orders");
            const data = await res.json();

            // Sortieren
            data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setOrders(data.orders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 2️⃣ Status ändern (PUT)
    const updateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: parseInt(newStatus) }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            // UI lokal updaten
            setOrders(prev =>
                prev.map(order =>
                    order._id === orderId
                        ? {
                            ...order,
                            status: [
                                ...order.status,
                                { update: parseInt(newStatus), date: new Date() },
                            ],
                        }
                        : order
                )
            );
        } catch (err) {
            console.error(err);
            alert("Error updating order status");
        }
    };

    useEffect(() => {
        if (userId && token && apiUrl) {
            fetchOrders();
        }
    }, [apiUrl, userId, token]);

    return {
        orders,
        loading,
        updateStatus,
    };
}
