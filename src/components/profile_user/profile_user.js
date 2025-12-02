import React, { useState, useEffect, useCallback } from "react";
import "./profile_user.css";
import { useTranslation } from "react-i18next";
import UserProfileHeader from "./user_profile_header";
import { useUserOrders } from "./hooks/useUserOrders";
import ProfileUserOrders from "./profile_user_oders";
import LoadingSpinner from "../loading/loading_spinner"
import { useNavigate } from "react-router-dom";

export default function ProfileUser() {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const ordersPerPage = 5; // Reduced for better visual flow
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const fetchUser = useCallback(async () => {
    const res = await fetch(`${apiUrl}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(data);
    console.log("ProfileUser data", data);
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) {
      fetchUser();
    }
  }, [userId, token, fetchUser]);


  const { orders, products, totalPages } = useUserOrders(
    apiUrl, userId, token, currentPage, ordersPerPage
  );

  if (!user) return <LoadingSpinner />;

  const totalOrders = orders.length;

  const openOrders = orders.filter(
    (o) => o.status?.length && o.status[o.status.length - 1].update !== "delivered"
  ).length;


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    window.location.href = "/login";
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
          />
        </div>
      </div>
    </div>
  );
}
