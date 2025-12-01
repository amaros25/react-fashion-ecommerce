import React, { useEffect, useState } from "react";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../const/order_status";
import "./seller_orders.css";

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

        // Sortiere nach Datum neueste zuerst
        data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, token, apiUrl]);

  // Status ändern
  const handleStatusChange = async (orderId, newStatus) => {
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

      // Update lokal die Orders, um UI zu aktualisieren
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
              ...order,
              status: [...order.status, { update: parseInt(newStatus), date: new Date() }],
            }
            : order
        )
      );
      // Optional: Toast success
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
            const lastStatusObj = order.status?.slice(-1)[0];
            const lastStatus = lastStatusObj ? lastStatusObj.update : ORDER_STATUS.PENDING;
            const createdAt = new Date(order.createdAt).toLocaleString();

            return (
              <tr key={order._id}>
                <td>{createdAt}</td>
                <td>
                  {order.items.map((item, idx) => (
                    <div key={idx}>{item.product?.name || "Unknown"}</div>
                  ))}
                </td>
                <td>
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.size} - {item.quantity}
                    </div>
                  ))}
                </td>
                <td>
                  {order.user?.address?.street}, {order.user?.address?.city},{" "}
                  {order.user?.address?.postalCode}
                </td>
                <td>
                  {order.user?.firstName} {order.user?.lastName} <br />
                  Tel: {order.user?.phone} <br />
                  Email: {order.user?.email}
                </td>
                <td>
                  <span className={`status-badge status-${lastStatus}`}>
                    {ORDER_STATUS_LABELS[lastStatus]}
                  </span>
                </td>
                <td>
                  <select
                    value={lastStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="status-select"
                  >
                    <option value={ORDER_STATUS.PENDING}>Pending</option>
                    <option value={ORDER_STATUS.CONFIRMED}>Confirmed</option>
                    <option value={ORDER_STATUS.READY_TO_PICKUP}>Ready to Pickup</option>
                    <option value={ORDER_STATUS.PICKED_UP}>Picked Up</option>
                    <option value={ORDER_STATUS.SHIPPED}>Shipped</option>
                    <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                    <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
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
