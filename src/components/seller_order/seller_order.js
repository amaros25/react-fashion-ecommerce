import React, { useEffect, useState } from "react";
import "./seller_orders.css";  // für Styles

function SellerOrders() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${apiUrl}/orders?seller=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();

        // Sortiere nach Datum neueste zuerst (angenommen createdAt gibt's)
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, token]);

  // Status ändern
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update lokal die Orders, um UI zu aktualisieren
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert("Error updating order status");
      console.error(err);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="seller-orders-container">

      <h2>Manage Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Size & Quantity</th>
            <th>Shipping Address</th>
            <th>Customer Info</th>
            <th>Status</th>
            <th>Change Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const lastStatus = order.status?.slice(-1)[0]?.update || "pending";
            const createdAt = new Date(order.createdAt).toLocaleString();

            return (
              <tr key={order._id}>
                <td>{createdAt}</td>
                <td>{order.productID?.name || "Unknown"}</td>
                <td>
                  {order.sizes.map((s) => (
                    <div key={s.size}>
                      {s.size} - {s.quantity}
                    </div>
                  ))}
                </td>
                <td>
                  {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </td>
                <td>
                  {order.userId?.firstName} {order.userId?.lastName} <br />
                  Tel: {order.userId?.phone} <br />
                  Email: {order.userId?.email}
                </td>
                <td>{lastStatus}</td>
                <td>
                  <select
                    value={lastStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SellerOrders;
