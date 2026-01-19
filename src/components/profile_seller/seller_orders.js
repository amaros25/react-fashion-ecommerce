import React, { useState } from "react";
import "./seller_orders.css";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../utils/loading_spinner";
import { FaSearch, FaFilter, FaBoxOpen } from "react-icons/fa";
import Pagination from "../home/pagination";
import { ORDER_STATUS } from "../utils/const/order_status";
import { useOrderManager } from "../api_managers/useUserOrderManager.js";
import MainOrderCard from "../profile_shared/main_order_card"

function SellerOrders({ sellerId, token }) {
  const { t, i18n } = useTranslation();

  // Lokale Zustände für die Eingabefelder (vor dem Absenden des Filters)
  const [localSearch, setLocalSearch] = useState("");
  const [localStatus, setLocalStatus] = useState("");

  const {
    orders,
    isLoading,
    totalPages,
    currentPage,
    paginate,
    applyFilter,
    updateStatus,
    updating // Neu: Ladezustand des Updates
  } = useOrderManager({
    role: 'seller',
    id: sellerId,
    token: token
  });

  // Funktion zum Auslösen der Suche/Filterung
  const handleFilterSubmit = () => {
    applyFilter(localStatus, localSearch);
  };

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
            value={localSearch} // Korrigiert
            onChange={(e) => setLocalSearch(e.target.value)} // Korrigiert
            onKeyDown={(e) => e.key === 'Enter' && handleFilterSubmit()} // Korrigiert
          />
        </div>

        <div className="filter-box">
          <FaFilter className="icon" />
          <select
            value={localStatus} // Korrigiert
            onChange={(e) => setLocalStatus(e.target.value)} // Korrigiert
          >
            <option value="">{t("order_state.all")}</option>
            <option value={ORDER_STATUS.PENDING}>{t("order_state.pending")}</option>
            <option value={ORDER_STATUS.CONFIRMED}>{t("order_state.confirmed")}</option>
            <option value={ORDER_STATUS.SHIPPED}>{t("order_state.shipped")}</option>
            <option value={ORDER_STATUS.DELIVERED}>{t("order_state.delivered")}</option>
            {/* ... restliche Optionen ... */}
            <option value={ORDER_STATUS.CANCELLED_USER}>{t("order_state.user_cancelled")}</option>
            <option value={ORDER_STATUS.CANCELLED_SELLER}>{t("order_state.seller_cancelled")}</option>
          </select>
          <button onClick={handleFilterSubmit} className="apply-btn">{t("filter")}</button>
        </div>
      </div>

      <div className="orders-list">
        {!isLoading && orders.length === 0 && (
          <div className="empty-state">
            <FaBoxOpen className="empty-icon" />
            <p>{t("noOrders")}</p>
          </div>
        )}

        {orders.map((order) => (

          <MainOrderCard
            key={order.id}
            order={order}
            t={t}
            viewMode="seller" // WICHTIG: Damit werden die Seller-Buttons aktiviert
            isUpdating={updating} // Den Ladezustand aus deinem Hook übergeben
            onStatusChange={(orderId, status, comment) =>
              updateStatus({ orderId, newStatus: status, comment })
            }
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

      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default SellerOrders;


//  <SellerOrderCard
//             key={order.id}
//             order={order}
//             t={t}
//             onStatusChange={(orderId, status, comment) => updateStatus({ orderId, newStatus: status, comment })}
//           />