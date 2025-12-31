import React, { useState, useEffect, useCallback } from "react";
import "./profile_user.css";
import { useTranslation } from "react-i18next";
import UserProfileHeader from "./user_profile_header";
import { useUserOrders } from "./hooks/useUserOrders";
import { useUserData } from "./hooks/useUserData";
import ProfileUserOrders from "./profile_user_oders";
import LoadingSpinner from "../loading/loading_spinner"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OrderStatusStepper from "./order_status_stepper";
export default function ProfileUser() {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshOrders, setRefreshOrders] = useState(0);
  const ordersPerPage = 5;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const { user, fetchUser, loading, error } = useUserData(apiUrl, userId, token);
  console.log("ProfileUser token: ", token);
  console.log("ProfileUser userId: ", userId);
  ;
  useEffect(() => {
    if (userId && token) {
      console.log("let's fetch user");
      fetchUser();
    } else {
      navigate("/login");
    }
  }, [userId, token, fetchUser, navigate]);

  const { orders, products, totalPages, allOrders } = useUserOrders(
    apiUrl, userId, token, currentPage, ordersPerPage, refreshOrders
  );

  if (loading || !user) return <LoadingSpinner />;
  if (error) return <div className="error-message">{t("error_loading_profile")}</div>;

  const totalOrders = allOrders.length;

  const openOrders = allOrders.filter(
    (o) => o.status?.length && o.status[o.status.length - 1].update !== "delivered"
  ).length;

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // 1. Fetch current status first
      const currentOrderRes = await fetch(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentOrderData = await currentOrderRes.json();

      if (!currentOrderRes.ok) {
        throw new Error("Could not fetch current order status");
      }

      // Check if status is still valid for this action
      const currentStatus = currentOrderData.status[currentOrderData.status.length - 1].update;
      console.log("handleStatusChange: currentStatus: ", currentStatus);
      console.log("handleStatusChange: newStatus: ", newStatus);
      // Define valid transitions (simplified check)
      // If user wants to cancel (newStatus = 30), current status must be 'pending' (0)
      if (newStatus === 30 && currentStatus !== 0) {
        toast.error(t("order_status_changed_reload"), { position: "top-center", autoClose: 5000 });
        setRefreshOrders(prev => prev + 1);
        return;
      }

      // If seller wants to confirm (newStatus = 1), current must be 'pending' (0)
      // (Seller logic typically handled in seller component but good to know)

      // Proceed with update
      console.log("handleStatusChange: newStatus: ", newStatus);
      console.log("handleStatusChange: apiUrl: ", apiUrl);
      console.log("handleStatusChange: orderId: ", orderId);
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        toast.success(
          t("statusUpdated", { status: t(`order_state.${newStatus}`) }),
          { position: "top-right", autoClose: 3000 }
        );
        setRefreshOrders(prev => prev + 1);
      } else {
        const errorData = await response.json();
        console.log("handleStatusChange: errorData: ", errorData);
        toast.error(
          t("updateFailed", { message: errorData.message || t("unknownError") }),
          { position: "top-right", autoClose: 5000 }
        );
      }
    } catch (error) {
      toast.error(
        t("updateFailed", { message: error.message }),
        { position: "top-right", autoClose: 5000 }
      );
    } finally {
      //setLoading(false);
    }
  };



  return (
    <div className="profile-user-page">
      <div className="profile-user-container">
        <UserProfileHeader user={user} totalOrders={totalOrders} openOrders={openOrders} t={t} />

        <div className="profile-content-section">
          <div className="section-header">
            <h3>{t("your_orders")}</h3>
            <div className="section-line"></div>
          </div>

          <ProfileUserOrders
            orders={orders}
            products={products}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            t={t}
            handleStatusChange={handleStatusChange}
            onRatingComplete={() => setRefreshOrders(prev => prev + 1)}
          />
        </div>
      </div>
    </div>
  );
}
