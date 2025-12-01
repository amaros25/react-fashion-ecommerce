import React, { useEffect, useState, useRef, useCallback } from "react";
import "./seller_orders.css";
import StatusSelect from "./status_select";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../products/loading_spinner";
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaBox } from "react-icons/fa";

function SellerOrders({ sellerId, handleStatusChange, refreshTrigger }) {
  const { t, i18n } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 5;
  const [searchOrder, setSearchOrder] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const selectRef = useRef(null);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchOrders();
  };


  const fetchOrders = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
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

      if (!res.ok) throw new Error("Serverfehler");

      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(Math.ceil(data.totalCount / ordersPerPage));
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [sellerId, currentPage, filterStatus, searchOrder, apiUrl]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshTrigger]);

  // Status im lokalen State aktualisieren
  const onStatusChange = (orderId, newStatus) => {
    setStatusUpdates((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  // Funktion zur Übersetzung der Farbe
  const translateColor = (color) => {
    // Check if it's a hex code
    if (color && color.startsWith('#')) {
      return <span className="color-dot" style={{ backgroundColor: color }} title={color}></span>;
    }
    const translated = t(`product_colors.${color?.toLowerCase()}`, { defaultValue: color });
    return translated;
  };

  // Seitenwechsel
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Array für Seitenzahlen
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'shipped': return 'blue';
      case 'confirmed': return 'purple';
      case 'pending': return 'orange';
      case 'cancelled':
      case 'user_cancelled':
      case 'seller_cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div
      className="seller-orders-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="orders-toolbar">
        <div className="search-box">
          <FaSearch className="icon" />
          <input
            type="text"
            placeholder={t("searchOrderNumber")}
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
        </div>

        <div className="filter-box">
          <FaFilter className="icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">{t("order_state.all")}</option>
            <option value="pending">{t("order_state.pending")}</option>
            <option value="confirmed">{t("order_state.confirmed")}</option>
            <option value="shipped">{t("order_state.shipped")}</option>
            <option value="delivered">{t("order_state.delivered")}</option>
            <option value="user_cancelled">{t("order_state.user_cancelled")}</option>
            <option value="seller_cancelled">{t("order_state.seller_cancelled")}</option>
          </select>
          <button onClick={handleFilter} className="apply-btn">{t("filter")}</button>
        </div>
      </div>

      <div className="orders-list">
        {!loading && orders.length === 0 && (
          <div className="empty-state">
            <FaBox className="empty-icon" />
            <p>{t("noOrders")}</p>
          </div>
        )}

        {orders.map((order) => {
          const currentStatus = order.status && Array.isArray(order.status) && order.status.length > 0
            ? order.status.slice(-1)[0]?.update
            : "pending";

          return (
            <div key={order._id} className="order-item-card">
              <div className="order-header-row">
                <div className="order-id-group">
                  <span className="order-label">Order</span>
                  <span className="order-id">#{order.orderNumber}</span>
                </div>
                <div className={`status-badge ${getStatusColor(currentStatus)}`}>
                  {t(`order_state.${currentStatus}`) || currentStatus}
                </div>
              </div>

              <div className="order-body">
                <div className="order-products">
                  {order.items && Array.isArray(order.items) && order.items.map((item, index) => (
                    <div key={index} className="product-row">
                      <img
                        src={item.product?.image?.[0] || ""}
                        alt={item.product?.name}
                        className="product-thumb"
                      />
                      <div className="product-details-text">
                        <span className="product-name">{item.product?.name || t("productName")}</span>
                        <div className="product-specs">
                          <span>Size: {item.size}</span>
                          <span className="dot">•</span>
                          <span className="color-spec">Color: {translateColor(item.color)}</span>
                          <span className="dot">•</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="product-price-display">
                        {(item.product?.price * item.quantity).toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-customer-info">
                  <div className="info-group">
                    <FaUser className="info-icon" />
                    <div>
                      <span className="info-label">Customer</span>
                      <p>{order.user ? `${order.user.firstName} ${order.user.lastName}` : t("noUser")}</p>
                      <p className="sub-text">{order.user?.phone || t("noPhone")}</p>
                    </div>
                  </div>
                  <div className="info-group">
                    <FaMapMarkerAlt className="info-icon" />
                    <div>
                      <span className="info-label">Shipping Address</span>
                      <p>{order.user?.address ? `${order.user.address.street}` : t("noAddress")}</p>
                      <p className="sub-text">
                        {order.user?.address ? `${order.user.address.postalCode} ${order.user.address.city}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="info-group">
                    <FaCalendarAlt className="info-icon" />
                    <div>
                      <span className="info-label">Date</span>
                      <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-footer">
                <div className="total-amount">
                  <span>Total Amount:</span>
                  <span className="amount">€ {order.totalPrice.toFixed(2)}</span>
                </div>

                <div className="status-actions">
                  {currentStatus !== "seller_cancelled" &&
                    currentStatus !== "delivered" &&
                    currentStatus !== "return_received" && (
                      <div className="update-status-wrapper">
                        <StatusSelect order={order} onStatusChange={onStatusChange} ref={selectRef} />
                        <button
                          className="update-btn"
                          onClick={() => {
                            const newStatus = selectRef.current.value;
                            handleStatusChange(order._id, newStatus);
                          }}
                        >
                          {t("update")}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`page-btn ${number === currentPage ? "active" : ""}`}
            >
              {number}
            </button>
          ))}
        </div>
      )}
      {loading && <LoadingSpinner />}
    </div>
  );
}

export default SellerOrders;
