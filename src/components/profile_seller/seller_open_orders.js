import React, { useEffect, useState } from "react";
import './seller_open_orders.css'; // Importiere die CSS-Datei

function SellerOpenOrders({ orders, handleStatusChange }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [statusUpdates, setStatusUpdates] = useState({});
  const [ordersWithDetails, setOrdersWithDetails] = useState([]);

  // Status im State aktualisieren
  const onStatusChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({ ...prev, [orderId]: newStatus }));
  };

  // Status an Backend schicken
  const onSubmit = (orderId) => {
    const newStatus = statusUpdates[orderId];
    if (newStatus) {
      handleStatusChange(orderId, newStatus);
    }
  };

  // Hol User und Produktdaten für jede Order
  useEffect(() => {
    async function fetchDetails() {
      const detailedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            // Holen der Produktdetails für jedes Item in der Bestellung
            const productDetails = await Promise.all(
              order.items.map(async (item) => {
                const productRes = await fetch(`${apiUrl}/products/${item.productId}`);
                const product = await productRes.json();
                return {
                  ...item,
                  product,
                };
              })
            );

            // Userdaten laden
            const userRes = await fetch(`${apiUrl}/users/${order.userId}`);
            const user = await userRes.json();
            return {
              ...order,
              items: productDetails,
              user,
            };
          } catch (error) {
            console.error("Fehler beim Laden von Produkt oder User", error);
            return order; // fallback: return bare order
          }
        })
      );
      setOrdersWithDetails(detailedOrders);
    }

    if (orders && orders.length > 0) {
      fetchDetails();
    } else {
      setOrdersWithDetails([]);
    }
  }, [orders]);

  return (
    <div className="order-container">
      {ordersWithDetails.map(order => (
        <div key={order._id} className="order-card">

          {/* Bestellnummer und Bestelldatum */}
          <div className="order-header">
            <div className="order-number">
              Bestellnummer: {order.orderNumber}
            </div>
            <div className="order-date">
              Bestelldatum: {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Produkt und Benutzerbereich nebeneinander */}
          <div className="order-details">

            {/* Linke Seite: Produktdetails */}
            <div className="product-details">
              {order.items.map((item, index) => (
        <div key={index} className="product-item">
            <img
              src={item.product?.image?.[0] || ''}
              alt={item.product?.name || 'Produktbild'}
              className="product-image"
            />
            <div className="product-info-container">
              <span className="product-title">
                {item.product?.name || 'Kein Produktname'}
              </span>
              <div className="product-info">
                Farbe: {item.color} | Größe: {item.size}
              </div>
              <div className="product-info">
                Menge: {item.quantity}
              </div>
              <div className="product-price">
                {`€ ${(item.product.price * item.quantity).toFixed(2)}`}
              </div>
            </div>
          </div>
                          ))}
            </div>

            {/* Rechte Seite: Benutzerinfo */}
            <div className="user-info">
              <div className="user-name">
                {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Kein Nutzer'}
              </div>
              <div className="user-contact">
                {order.user?.phone || 'Keine Telefonnummer'}
              </div>
              <div className="user-address">
                {order.user?.address
                  ? `${order.user.address.street}, ${order.user.address.postalCode}  ${order.user.address.city}, ${order.user.address.country}`
                  : 'Keine Adresse'}
              </div>
            </div>
          </div>

          {/* Gesamtpreis */}
          <div className="total-price">
            <div className="price">
              Gesamtpreis: {`€ ${(order.totalPrice).toFixed(2)}`}
            </div>
          </div>

          {/* Status Dropdown, Update Button, Aktueller Status und Letztes Update */}
          <div className="status-update">
            {/* Links: Status Dropdown und Update Button */}
            <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
              <select
                className="status-select"
                value={statusUpdates[order._id] ?? order.status?.slice(-1)[0]?.update ?? 'pending'}
                onChange={e => onStatusChange(order._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                className="update-button"
                onClick={() => onSubmit(order._id)}
              >
                Update
              </button>
            </div>

            {/* Rechts: Aktueller Status und Letztes Update */}
            <div className="status-info">
              <div>
                <strong>Aktueller Status:</strong> {order.status?.slice(-1)[0]?.update || 'pending'}
              </div>
              <div>
                <strong>Letztes Update:</strong> {new Date(order.status?.slice(-1)[0]?.date).toLocaleDateString() || 'Noch kein Update'}
              </div>
            </div>

          </div>

        </div>
      ))}
    </div>
  );
}

export default SellerOpenOrders;
