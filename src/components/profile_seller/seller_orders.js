import React, { useEffect, useState, useCallback } from "react";
import "./seller_orders.css";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../utils/loading_spinner";
import { FaSearch, FaFilter, FaBoxOpen } from "react-icons/fa";
import SellerOrderCard from "./seller_order_card";

import Pagination from "../home/pagination";
import { useSellerOrders } from "./hooks/useSellerOrders";
import { ORDER_STATUS } from "../utils/const/order_status";
function SellerOrders({ sellerId, handleStatusChange, refreshTrigger }) {
  // ... existing code ...

  const getStatusColor = (status) => {
    // Handle both string and integer status
    if (status === 'pending' || status === ORDER_STATUS.PENDING) return 'orange';
    if (status === 'confirmed' || status === ORDER_STATUS.CONFIRMED) return 'purple';
    if (status === 'shipped' || status === ORDER_STATUS.SHIPPED) return 'blue';
    if (status === 'delivered' || status === ORDER_STATUS.DELIVERED) return 'green';
    if (status === 'user_cancelled' || status === ORDER_STATUS.CANCELLED_USER) return 'red';
    if (status === 'seller_cancelled' || status === ORDER_STATUS.CANCELLED_SELLER) return 'red';
    if (status === 'picked_up' || status === ORDER_STATUS.PICKED_UP) return 'green';
    if (status === 'ready_pickup' || status === ORDER_STATUS.READY_TO_PICKUP) return 'blue';

    return 'gray';
  };
  const { t, i18n } = useTranslation();

  const {
    orders,
    loading,
    currentPage,
    totalPages,
    searchOrder,
    setSearchOrder,
    filterStatus,
    setFilterStatus,
    products,
    handleFilter,
    paginate
  } = useSellerOrders(sellerId, refreshTrigger);

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

  return (
    <div
      className="seller-orders-main-container"
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
            <option value={ORDER_STATUS.PENDING}>{t("order_state.pending")}</option>
            <option value={ORDER_STATUS.CONFIRMED}>{t("order_state.confirmed")}</option>
            <option value={ORDER_STATUS.SHIPPED}>{t("order_state.shipped")}</option>
            <option value={ORDER_STATUS.DELIVERED}>{t("order_state.delivered")}</option>

            <option value={ORDER_STATUS.FIRST_TRY_DELIVERY_FAILED}>{t("order_state.first_try_delivery_failed")}</option>
            <option value={ORDER_STATUS.SECOND_TRY_DELIVERY}>{t("order_state.second_try_delivery")}</option>
            <option value={ORDER_STATUS.FAILED_DELIVERY}>{t("order_state.failed_delivery")}</option>

            <option value={ORDER_STATUS.READY_TO_PICKUP}>{t("order_state.ready_pickup")}</option>
            <option value={ORDER_STATUS.PICKED_UP}>{t("order_state.picked_up")}</option>
            <option value={ORDER_STATUS.PICK_UP_FAILED}>{t("order_state.pick_up_failed")}</option>

            <option value={ORDER_STATUS.RETURN_REQUESTED}>{t("order_state.return_requested")}</option>
            <option value={ORDER_STATUS.RETURN_CONFIRMED}>{t("order_state.return_confirmed")}</option>
            <option value={ORDER_STATUS.RETURN_REFUSED}>{t("order_state.return_refused")}</option>
            <option value={ORDER_STATUS.RETURN_SHIPPED}>{t("order_state.return_shipped")}</option>
            <option value={ORDER_STATUS.RETURN_RECEIVED}>{t("order_state.return_received")}</option>
            <option value={ORDER_STATUS.RETURN_NOT_RECEIVED}>{t("order_state.return_not_received")}</option>

            <option value={ORDER_STATUS.CANCELLED_USER}>{t("order_state.user_cancelled")}</option>
            <option value={ORDER_STATUS.CANCELLED_SELLER}>{t("order_state.seller_cancelled")}</option>
          </select>
          <button onClick={handleFilter} className="apply-btn">{t("filter")}</button>
        </div>
      </div>

      <div className="orders-list">
        {!loading && orders.length === 0 && (
          <div className="empty-state">
            <FaBoxOpen className="empty-icon" />
            <p>{t("noOrders")}</p>
          </div>
        )}

        {orders.map((order) => (
          <SellerOrderCard
            key={order._id}
            order={order}
            products={products}
            t={t}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      )}
      {loading && <LoadingSpinner />}
    </div>
  );
}

export default SellerOrders;
