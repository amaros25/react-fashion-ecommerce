import React, { useState } from "react";
import "./profile_user.css";
import {Header} from "../header/header";
import {useTranslation} from "react-i18next";
import UserProfileHeader from "./user_profile_header";
import {useUserOrders} from "./hooks/useUserOrders";
import ProfileUserOrders from "./profile_user_oders";
import LoadingSpinner from "../loading/loading_spinner"
import Foot from '../foot/foot';

export default function ProfileUser() {

  const { t } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const user = JSON.parse(localStorage.getItem("userData"));
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
 
  const { orders, products, totalPages } = useUserOrders(
    apiUrl, userId, token, currentPage, ordersPerPage
  );

  if (!user) return LoadingSpinner();

  const totalOrders = orders.length;

  const openOrders = orders.filter(
    (o) => o.status?.length && o.status[o.status.length - 1].update !== "delivered"
  ).length;

  return (
    <div className="profile-user-container">
      <Header />
      <UserProfileHeader user={user} totalOrders={totalOrders} openOrders={openOrders} t={t}/>
      <h3>📦 {t("your_orders")}</h3>
      <ProfileUserOrders
        orders={orders}
        products={products}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        t={t}
      />
       <Foot />
    </div>
  );

}
