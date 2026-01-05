import React, { useState, useEffect, useCallback } from "react";
import "./profile_seller.css";
import AddProduct from "../new_product/add_product";
import SellerProducts from "./seller_products";
import ProfileSellerHeader from "./profile_seller_header";
import SellerOrders from "./seller_orders.js";
import { useSellerData } from "./hooks/useSellerData";
import SellerBills from "./seller_bills.js";
import LoadingSpinner from "../utils/loading_spinner.js";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

function ProfileSeller() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { userId, token } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("add_new_product");
  const tabKeys = ["products", "openOrders", "allOrders"];
  const [refreshOrders, setRefreshOrders] = useState(0);

  const { seller, loading, error, fetchSeller } = useSellerData(apiUrl, userId, token);


  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // 1. Fetch current status first
      const currentOrderRes = await fetch(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentOrderData = await currentOrderRes.json();

      if (!currentOrderRes.ok) {
        throw new Error(currentOrderRes.status === 404 ? "order_not_found" : "fetch_order_failed");
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

  useEffect(() => {
    if (userId && token) {
      fetchSeller();
    }
  }, [userId, token, fetchSeller]);

  if (loading || !seller) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{t(error)}</div>;
  }

  return (
    <div className="profile-seller-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <ProfileSellerHeader
        seller={seller}
        apiUrl={apiUrl}
        token={token}
      />
      <nav className="seller-profile-nav">
        {["add_new_product", "products", "allOrders", "bills"].map((tab) => {
          let label = "";
          if (tab === "add_new_product") label = t("add_new_product");
          if (tab === "products") label = t(`tabs_seller.${tabKeys[0]}`);
          if (tab === "allOrders") label = t(`tabs_seller.${tabKeys[2]}`);
          if (tab === "bills") label = t("tabs_seller.bills");

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
        {activeTab === "bills" && (
          <SellerBills sellerId={userId} apiUrl={apiUrl} token={token} />
        )}
        {activeTab === "add_new_product" && <AddProduct />}
      </div>
    </div>
  );
}

export default ProfileSeller;
