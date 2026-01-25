import { useState, useEffect, useCallback } from "react";
import "./profile_seller.css";
import AddProduct from "../new_product/add_product";
import SellerProducts from "./seller_products";
import SellerOrders from "./seller_orders.js";

import SellerBills from "./seller_bills.js";
import LoadingSpinner from "../utils/loading_spinner.js";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useUserProfileManager } from "../api_managers/userProfileHookManager.js";
import MainProfileHeader from "../profile_shared/main_profile_header";

function ProfileSeller() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { userId, token } = useAuth();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("sellerActiveTab") || "add_new_product";
  });
  const tabKeys = ["products", "openOrders", "allOrders"];
  const [refreshOrders, setRefreshOrders] = useState(0);


  useEffect(() => {
    localStorage.setItem("sellerActiveTab", activeTab);
  }, [activeTab]);
  /**
   * 1. FETCH USER DATA
   * Uses TanStack Query to fetch and cache basic user profile information.
   */
  const {
    user: seller,
    loading: sellerLoading,
    error: sellerError,
    updateAddress,
    updatePhone,
    updateShopName,
    updateImage,
    isUpdatingAddress,
    isUpdatingPhone,
    isUpdatingShopName,
    isUpdatingImage
  } = useUserProfileManager(userId, token);

  if (sellerLoading || !seller) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-seller-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>


      <MainProfileHeader
        data={seller} // 'user' statt 'seller'
        updateAddress={updateAddress}
        updatePhone={updatePhone}
        updateShopName={updateShopName}
        updateImage={updateImage}
        isUpdatingAddress={isUpdatingAddress}
        isUpdatingPhone={isUpdatingPhone}
        isUpdatingShopName={isUpdatingShopName}
        isUpdatingImage={isUpdatingImage}
        viewMode="seller"
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
        {activeTab === "add_new_product" && (
          <AddProduct sellerId={userId} token={token} seller={seller} />
        )}
        {activeTab === "products" && (
          <SellerProducts sellerId={userId} token={token} />
        )}
        {activeTab === "allOrders" && (
          <SellerOrders
            sellerId={userId}
            token={token}
          />
        )}
        {activeTab === "bills" && (
          <SellerBills sellerId={userId} apiUrl={apiUrl} token={token} />
        )}

      </div>
    </div>
  );
}

export default ProfileSeller;
