import React, { useEffect, useState } from "react";
import "./seller_orders.css";
import StatusSelect from "./status_select";
import { useTranslation } from "react-i18next";

function SellerOrders({ sellerId, handleStatusChange }) {
  const { t, i18n } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [orders, setOrders] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 5;
  const [searchOrder, setSearchOrder] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleFilter = () => {
    setCurrentPage(1);
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
      console.error("Error loading orders:", error);
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

        // Standardwert für status setzen
        const ordersWithDefaultStatus = data.orders.map(order => ({
        ...order,
        status: order.status || [] // Falls status nicht gesetzt, leeren Array verwenden
        }));

        // Erwartet: { orders: [...], totalCount: number }
        setOrders(data.orders);
        setTotalPages(Math.ceil(data.totalCount / ordersPerPage));
      } catch (error) {
        console.error("Error loading orders:", error);
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
    <div
      className="order-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
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
          <option value="">{t("order_state.all")}</option>
          <option value="pending">{t("order_state.pending")}</option>
          <option value="confirmed">{t("order_state.confirmed")}</option>
          <option value="shipped">{t("order_state.shipped")}</option>
          <option value="delivered">{t("order_state.delivered")}</option>
          <option value="received">{t("order_state.received")}</option>
          <option value="user_cancelled">
            {t("order_state.user_cancelled")}
          </option>
          <option value="seller_cancelled">
            {t("order_state.seller_cancelled")}
          </option>
          <option value="failed_delivery">
            {t("order_state.failed_delivery")}
          </option>
          <option value="returned_to_sender">
            {t("order_state.returned_to_sender")}
          </option>
          <option value="return_requested">
            {t("order_state.return_requested")}
          </option>
          <option value="return_confirmed">
            {t("order_state.return_confirmed")}
          </option>
          <option value="return_shipped">
            {t("order_state.return_shipped")}
          </option>
          <option value="return_received">
            {t("order_state.return_received")}
          </option>
        </select>

        <button onClick={handleFilter} className="filter-button">
          {t("filter")}
        </button>
      </div>

      {orders.length === 0 && (
        <p className="no-orders-message">{t("noOrders")}</p>
      )}

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
              {order.items && Array.isArray(order.items) && order.items.map((item, index) => (
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
                      {t("productSize")}: {item.size} | {t("quantity")}:{" "}
                      {item.quantity}
                    </div>
                    <div className="product-price">
                       {(item.product?.price * item.quantity).toFixed(2) || "0.00"}  {t("price_suf")} 
                    </div>
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
                </div>
              ))}
            </div>

          
          </div>

          <div className="total-price">
            <div className="price">
              {t("totalPrice")}: € {order.totalPrice.toFixed(2)}
            </div>
          </div>

          <div className="status-update">
            <div className="status-update-container">
              <StatusSelect order={order} onStatusChange={onStatusChange} />
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
            {order.status && Array.isArray(order.status) && order.status.length > 0
              ? t(`order_state.${order.status.slice(-1)[0]?.update}`) || t("order_state.pending")
              : t("order_state.pending")}
          </div>
              <div>
                  <strong>{t("lastUpdate")}:</strong>{" "}
              {order.status && Array.isArray(order.status) && order.status.length > 0
                ? order.status.slice(-1)[0]?.date
                  ? new Date(order.status.slice(-1)[0].date).toLocaleDateString()
                  : t("noUpdate")
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
