import React, { useState, useEffect } from "react";
import "./profile_user.css";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../loading/loading_spinner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Pagination from "../home/pagination";
import { useUserProfileManager } from "../api_managers/userProfileHookManager.js";
import { useOrderManager } from "../api_managers/useUserOrderManager.js";
import MainOrderCard from "../profile_shared/main_order_card";
import MainProfileHeader from "../profile_shared/main_profile_header";

export default function ProfileUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const { userId, token } = useAuth();
  const ordersPerPage = 5;

  /**
   * 1. FETCH USER DATA
   * Uses TanStack Query to fetch and cache basic user profile information.
   */
  const {
    user,
    loading: userLoading,
    error: userError,
    updateAddress,
    updatePhone,
    updateImage
  } = useUserProfileManager(userId, token);
  /**
   * 2. FETCH ORDERS & MANAGE STATUS UPDATES
   * This custom hook now handles both:
   * - Fetching the list of orders (Query)
   * - Updating an order status (Mutation)
   */

  const {
    orders,
    totalOrdersCount,
    products,
    totalPages,
    currentPage,
    loading: loadingOrders,
    updating,
    paginate,
    updateStatus,
    refetch: refetchOrders
  } = useOrderManager({ role: 'user', id: userId, token: token, initialLimit: ordersPerPage });

  /**
   * AUTHENTICATION GUARD
   * Redirects user to login if credentials (userId/token) are missing.
   */
  useEffect(() => {
    if (!userId || !token) navigate("/login");
  }, [userId, token, navigate]);


  /**
   * 3. STATUS CHANGE HANDLER
   * Triggered when a user clicks 'Cancel' or other action buttons.
   * Logic:
   * - updateStatus() is called (provided by the Mutation in our hook).
   * - The hook automatically validates the status against the current cache.
   * - If successful, the cache is invalidated, causing the list to refresh automatically.
   */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Trigger the mutation and wait for it to finish
      await updateStatus({ orderId, newStatus });

      toast.success(
        t("statusUpdated", { status: t(`order_state.${newStatus}`) }),
        { position: "top-right", autoClose: 3000 }
      );
    } catch (err) {
      // Catch errors from either the server or our local cache validation logic
      toast.error(t(err.message || "updateFailed"), {
        position: "top-center",
        autoClose: 5000
      });
    }
  };

  /**
   * RENDER LOGIC: LOADING & ERROR STATES
   */
  if (userLoading || loadingOrders) return <LoadingSpinner />;
  // if (userError || ordersError) return <div className="error-message">{t(userError || ordersError)}</div>;

  return (
    <div className="profile-user-page">
      <div className="profile-user-container">
        {/* Profile Header (Avatar, Name, Actions) */}

        <MainProfileHeader
          data={user} // 'user' statt 'seller'
          updateAddress={updateAddress}
          updatePhone={updatePhone}
          updateImage={updateImage}
          viewMode="user"
        />
        <div className="profile-content-section">
          <div className="section-header-user-profile">
            <h2>{t("your_orders")}</h2>
            <span className="user-profile-collection-count">
              {totalOrdersCount} {t("orders")}
            </span>
          </div>

          {/**
           * LOADING OVERLAY
           * Shows spinner if initial loading OR an update (mutation) is happening.
           */}
          {loadingOrders || updating ? (
            <LoadingSpinner />
          ) : orders.length === 0 ? (
            <div className="no-orders-placeholder">
              <p>{t("no_orders_yet")}</p>
            </div>
          ) : (
            <>
              {/* List of Orders */}
              <div className="orders-list">
                {orders.map((order) => (
                  <MainOrderCard
                    key={order.id}
                    order={order}
                    products={products}
                    t={t}
                    onStatusChange={handleStatusChange}
                    onRatingComplete={() => refetchOrders()}
                    isUpdating={updating}
                    viewMode="user" // Explizit für die User-Ansicht
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={paginate}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
