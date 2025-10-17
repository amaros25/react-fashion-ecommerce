import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./seller_orders.css";

function SellerOrders({ sellerId, handleStatusChange }) {
  const { t } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [orders, setOrders] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 20;
const [searchOrder, setSearchOrder] = useState("");
const [filterStatus, setFilterStatus] = useState("");

const handleFilter = () => {
  setCurrentPage(1); // Zurück zur ersten Seite bei neuem Filter
  fetchOrders();
};


async function fetchOrders() {
  try {
    const queryParams = new URLSearchParams({
      page: currentPage,
      limit: ordersPerPage,
    });

    if (filterStatus) queryParams.append("status", filterStatus);
    if (searchOrder) queryParams.append("orderNumber", searchOrder);

    const res = await fetch(
      `${apiUrl}/orders/seller/${sellerId}?${queryParams.toString()}`
    );

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Serverfehler");
    }

    const data = await res.json();
    setOrders(data.orders);
    setTotalPages(Math.ceil(data.totalCount / ordersPerPage));
  } catch (error) {
    console.error("Fehler beim Laden der Bestellungen:", error);
    setOrders([]);
    setTotalPages(1);
  }
}


  // Daten vom Backend laden (mit Pagination)
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(
        `${apiUrl}/orders/seller/${sellerId}?page=${currentPage}&limit=${ordersPerPage}`

        );
        const data = await res.json();

        // Erwartet: { orders: [...], totalCount: number }
        setOrders(data.orders);
        setTotalPages(Math.ceil(data.totalCount / ordersPerPage));
      } catch (error) {
        console.error("Fehler beim Laden der Bestellungen:", error);
        setOrders([]);
        setTotalPages(1);
      }
    }

    if (sellerId) {
      fetchOrders();
    }
  }, [sellerId, currentPage, apiUrl]);

  // Status im lokalen State aktualisieren
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

  // Funktion zur Übersetzung der Farbe
  const translateColor = (color) => {
    const translatedColor =
      t(`product_color.${color}`) || t(`product_color.${color.toLowerCase()}`);
    return translatedColor || color;
  };

  // Seitenwechsel
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Array für Seitenzahlen (Optional: max 5 Seiten anzeigen)
  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (



    <div className="order-container">

      
        <div className="order-filter-card">
      <input
        type="text"
        placeholder={t("searchOrderNumber")}
        value={searchOrder}
        onChange={(e) => setSearchOrder(e.target.value)}
        className="search-input"
      />

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="filter-select"
      >
        <option value="">{t("allStatuses")}</option>
        <option value="pending">{t("pending")}</option>
        <option value="confirmed">{t("confirmed")}</option>
        <option value="shipped">{t("shipped")}</option>
        <option value="delivered">{t("delivered")}</option>
        <option value="cancelled">{t("cancelled")}</option>
      </select>

      <button onClick={handleFilter} className="filter-button">
        {t("filter")}
      </button>
    </div>

      {orders.length === 0 && <p>{t("noOrders")}</p>}

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div className="order-number">
              {t("orderNumber")}: {order.orderNumber}
            </div>
            <div className="order-date">
              {t("orderDate")}: {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="order-details">
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
                      € {(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="user-info">
              <div className="user-name">
                {order.user
                  ? `${order.user.firstName} ${order.user.lastName}`
                  : t("noUser")}
              </div>
              <div className="user-contact">{order.user?.phone || t("noPhone")}</div>
              <div className="user-address">
                {order.user?.address
                  ? `${order.user.address.street}, ${order.user.address.postalCode} ${order.user.address.city}`
                  : t("noAddress")}
              </div>
            </div>
          </div>

          <div className="total-price">
            <div className="price">
              {t("totalPrice")}: € {order.totalPrice.toFixed(2)}
            </div>
          </div>

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

              <button className="update-button" onClick={() => onSubmit(order._id)}>
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
                {order.status?.slice(-1)[0]?.date
                  ? new Date(order.status.slice(-1)[0].date).toLocaleDateString()
                  : t("noUpdate")}
              </div>
            </div>
          </div>
        </div>
      ))}

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

export default SellerOrders;