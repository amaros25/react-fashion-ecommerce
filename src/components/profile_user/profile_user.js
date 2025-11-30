import React, { useState } from "react";
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
  const ordersPerPage = 10;
  const user = JSON.parse(localStorage.getItem("userData"));
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  console.log("🟢 user", user);
  console.log("🟢 userId", userId);
  console.log("🟢 token", token);
  const { orders, products, totalPages } = useUserOrders(
    apiUrl, userId, token, currentPage, ordersPerPage
  );

  if (!user) return LoadingSpinner();

  const totalOrders = orders.length;

  const openOrders = orders.filter(
    (o) => o.status?.length && o.status[o.status.length - 1].update !== "delivered"
  ).length;

  const handleLogout = () => {
    localStorage.clear();

    navigate("/home");
  };
  {/* {isLoggedIn && (
  <img
    src="/icons/logout_icon.svg"
    style={{ width: "24px", height: "24px" }}
    className="nav-icon"
    onClick={handleLogout}
  />
)} */}

  return (
    <div className="profile-user-container">
      <UserProfileHeader user={user} totalOrders={totalOrders} openOrders={openOrders} t={t} />
      <button className="logout-btn" onClick={handleLogout}>
        <img src="/icons/logout_icon.svg" alt="logout" />
        {t("logout")}
      </button>
      <h3>📦 {t("your_orders")}</h3>
      {/* <ProfileUserOrders
        orders={orders}
        products={products}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        t={t}
      /> */}

    </div>
  );

}
