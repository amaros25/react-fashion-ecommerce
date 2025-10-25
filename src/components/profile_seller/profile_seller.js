import React, { useState, useEffect, useCallback } from "react";
import { Header } from "../header/header.js";
import "./profile_seller.css";
import AddProduct from "../new_product/add_product";
import SellerProducts from "./seller_products";
import ProfileSellerHeader from "./profile_seller_header";
import SellerOrders from "./seller_orders.js";
import LoadingSpinner from "../products/loading_spinner.js";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function ProfileSeller() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const [seller, setSeller] = useState(null);
  const [filteredOpenOrders, setFilteredOpenOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("add_new_product");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const tabKeys = ["products", "openOrders", "allOrders"];
  const [loading, setLoading] = useState(false);
  const [refreshOrders, setRefreshOrders] = useState(0);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
     // setLoading(true);

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

        // Toast in aktiver Sprache
        toast.success(
          t("statusUpdated", { status: t(`order_state.${newStatus}`) }),
          { position: "top-right", autoClose: 3000 }
        );
        setRefreshOrders(prev => prev + 1);
      } else {
        const errorData = await response.json();
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

  // Fetch Funktionen
  const fetchSeller = useCallback(async () => {
    const res = await fetch(`${apiUrl}/sellers/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSeller(data);
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) {
      fetchSeller();
    }
  }, [userId, token, fetchSeller]);
  
  if (!seller) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-seller-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <Header />
      <ProfileSellerHeader
        seller={seller}
        openOrders={filteredOpenOrders}
        orders={filteredOpenOrders}
      />
      <nav
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          cursor: "pointer",
          justifyContent: "center",
        }}
      >
        {["add_new_product", "products", "allOrders"].map((tab) => {
          let label = "";
          if (tab === "add_new_product") label = t(t("add_new_product"));
          if (tab === "products") label = t(`tabs_seller.${tabKeys[0]}`);
          if (tab === "allOrders") label = t(`tabs_seller.${tabKeys[2]}`);

          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                borderBottom:
                  activeTab === tab
                    ? "3px solid #007bff"
                    : "3px solid transparent",
                fontWeight: activeTab === tab ? "bold" : "normal",
                color: activeTab === tab ? "#007bff" : "#555",
                transition: "all 0.3s ease",
                userSelect: "none",
              }}
            >
              {label}
            </div>
          );
        })}
      </nav>
      <div>
        {activeTab === "products" && (
          <SellerProducts sellerId={userId} apiUrl={apiUrl} token={token} />
        )}
        {activeTab === "allOrders" && (
          <SellerOrders
            sellerId={userId}
            handleStatusChange={handleStatusChange}
            refreshTrigger={refreshOrders} 
          />
        )}
        {activeTab === "add_new_product" && <AddProduct />}
      </div>
    </div>
  );
}

export default ProfileSeller;
