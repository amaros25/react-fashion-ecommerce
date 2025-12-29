import React, { useState, useEffect, useCallback } from "react";
import "./profile_seller.css";
import AddProduct from "../new_product/add_product";
import SellerProducts from "./seller_products";
import ProfileSellerHeader from "./profile_seller_header";
import SellerOrders from "./seller_orders.js";
import LoadingSpinner from "../utils/loading_spinner.js";
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
      // 1. Fetch current status first
      const currentOrderRes = await fetch(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentOrderData = await currentOrderRes.json();

      if (!currentOrderRes.ok) {
        throw new Error("Could not fetch current order status");
      }

      const currentStatus = currentOrderData.status[currentOrderData.status.length - 1].update;

      // Define valid transitions for Seller
      // If confirming (1), must be 'pending'
      if (newStatus === 1 && currentStatus !== 0) {
        toast.error(t("order_status_changed_reload"), { position: "top-center", autoClose: 5000 });
        setRefreshOrders(prev => prev + 1);
        return;
      }
      // If shipping (2) or (45 - ready pickup depending on implementation), usually needs 'confirmed'
      // Adjust logic as needed. For now preventing conflicting updates if user cancelled
      if ((newStatus === 1 || newStatus === 2 || newStatus === 3) && (currentStatus === 30 || currentStatus === 31)) {
        toast.error(t("order_cancelled_reload"), { position: "top-center", autoClose: 5000 });
        setRefreshOrders(prev => prev + 1);
        return;
      }


      // setLoading(true);
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

  // Fetch Funktionen
  const fetchSeller = useCallback(async () => {
    const res = await fetch(`${apiUrl}/sellers/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("data", data);
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
      <ProfileSellerHeader
        seller={seller}
        apiUrl={apiUrl}
        token={token}
      />
      <nav className="seller-profile-nav">
        {["add_new_product", "products", "allOrders"].map((tab) => {
          let label = "";
          if (tab === "add_new_product") label = t(t("add_new_product"));
          if (tab === "products") label = t(`tabs_seller.${tabKeys[0]}`);
          if (tab === "allOrders") label = t(`tabs_seller.${tabKeys[2]}`);

          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`seller-nav-item ${activeTab === tab ? "active" : ""}`}
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
