import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Importiere den i18n Hook
import "./seller_open_orders.css"; // Importiere die CSS-Datei

function SellerOpenOrders({ orders, handleStatusChange }) {
  const { t } = useTranslation(); // Initialisiere den Übersetzungs-Hook
  const apiUrl = process.env.REACT_APP_API_URL;
  const [statusUpdates, setStatusUpdates] = useState({});
  const [ordersWithDetails, setOrdersWithDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Aktuelle Seite
  const ordersPerPage = 1; // Bestellungen pro Seite

  // Status im State aktualisieren
  const onStatusChange = (orderId, newStatus) => {
    setStatusUpdates((prev) => ({ ...prev, [orderId]: newStatus }));
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
                const productRes = await fetch(
                  `${apiUrl}/products/${item.productId}`
                );
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
      setOrdersWithDetails([]); // Leere Orders zurücksetzen, wenn keine vorhanden sind
    }
  }, [orders]);

  // Funktion, um eine Farbe zu übersetzen
  const translateColor = (color) => {
    const translatedColor =
      t(`product_color.${color}`) || t(`product_color.${color.toLowerCase()}`);
    return translatedColor || color; // Falls keine Übersetzung gefunden, gib den Originalfarbwert zurück.
  };

  // Berechnen, welche Bestellungen auf der aktuellen Seite angezeigt werden
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = ordersWithDetails.slice(indexOfFirstOrder, indexOfLastOrder);

  // Berechnen der Gesamtzahl der Seiten
  const totalPages = Math.ceil(ordersWithDetails.length / ordersPerPage);

  // Seitenwechsel-Funktion
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generierung der Seitenzahlen (max. 5 Seitenzahlen anzeigen)
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="order-container">
      {currentOrders.map((order) => (
        <div key={order._id} className="order-card">
          {/* Bestellnummer und Bestelldatum */}
          <div className="order-header">
            <div className="order-number">
              {t("orderNumber")}: {order.orderNumber}
            </div>
            <div className="order-date">
              {t("orderDate")}: {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Produkt und Benutzerbereich nebeneinander */}
          <div className="order-details">
            {/* Linke Seite: Produktdetails */}
            <div className="product-details">
              {order.items.map((item, index) => (
                <div key={index} className="product-item">
                  <img
                    src={item.product?.image?.[0] || ""}
                    alt={item.product?.name || t("productName")}
                    className="product-image"
                  />
                  <div className="product-info-container">
                    <span className="product-title">
                      {item.product?.name || t("productName")}
                    </span>
                    <div className="product-info">
                      {t("productColor")}: {translateColor(item.color)} |{" "}
                      {t("productSize")}: {item.size}
                    </div>
                    <div className="product-info">
                      {t("quantity")}: {item.quantity}
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
                {order.user
                  ? `${order.user.firstName} ${order.user.lastName}`
                  : t("noUser")}
              </div>
              <div className="user-contact">
                {order.user?.phone || t("noPhone")}
              </div>
              <div className="user-address">
                {order.user?.address
                  ? `${order.user.address.street}, ${order.user.address.postalCode} ${order.user.address.city}`
                  : t("noAddress")}
              </div>
            </div>
          </div>

          {/* Gesamtpreis */}
          <div className="total-price">
            <div className="price">
              {t("totalPrice")}: {`€ ${order.totalPrice.toFixed(2)}`}
            </div>
          </div>

          {/* Status Dropdown, Update Button, Aktueller Status und Letztes Update */}
          <div className="status-update">
            <div style={{ display: "flex", gap: "10px", flex: 1 }}>
              <select
                className="status-select"
                value={
                  statusUpdates[order._id] ??
                  order.status?.slice(-1)[0]?.update ??
                  "pending"
                }
                onChange={(e) => onStatusChange(order._id, e.target.value)}
              >
                <option value="pending">{t("pending")}</option>
                <option value="confirmed">{t("confirmed")}</option>
                <option value="shipped">{t("shipped")}</option>
                <option value="delivered">{t("delivered")}</option>
                <option value="cancelled">{t("cancelled")}</option>
              </select>

              <button
                className="update-button"
                onClick={() => onSubmit(order._id)}
              >
                {t("update")}
              </button>
            </div>

            <div className="status-info">
              <div>
                <strong>{t("currentStatus")}:</strong>{" "}
                {t(`order_state.${order.status?.slice(-1)[0]?.update}`) ||
                  t("order_state.pending")}
              </div>
              <div>
                <strong>{t("lastUpdate")}:</strong>{" "}
                {new Date(
                  order.status?.slice(-1)[0]?.date
                ).toLocaleDateString() || t("noUpdate")}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Numerische Paginierungs-Steuerung */}
      <div className="pagination">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={number === currentPage ? "active" : ""}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SellerOpenOrders;
