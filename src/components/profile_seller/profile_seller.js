import React, { useState, useEffect, useCallback } from "react";
 
import { Header } from "../header/header.js";
import { useNavigate } from "react-router-dom";
import "./profile_seller.css";
import { useTranslation } from "react-i18next";
import AddProduct from "../new_product/add_product";
import SellerProducts from "./seller_products";
import ProfileSellerHeader from "./profile_seller_header"
import SellerOrders from "./seller_orders.js"

function ProfileSeller() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOpenOrders, setFilteredOpenOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const tabKeys = ["products", "openOrders", "allOrders"];

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        console.log("Order updated:", updatedOrder);
      } else {
        const errorData = await response.json();
        console.error("Error updating status:", errorData.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
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

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`${apiUrl}/orders/seller/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("🟢 fetchOrders: ", data);

    if (Array.isArray(data)) {
      setOrders(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
      const openOrdersList = data.filter(
        (order) =>
          order.status.length <= 2 &&
          (order.status[0].update === "pending" ||
            order.status[0].update === "confirmed")
      );
      setFilteredOpenOrders(
        openOrdersList.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } else {
      setOrders([]); // Leeres Array, falls data kein Array ist
      setFilteredOpenOrders([]); // Leeres Array, falls data kein Array ist
      console.error("Erwartetes Array, aber bekommen:", data);
    }
  }, [userId, token]);

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`${apiUrl}/products/seller/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("🟢 fetchProducts: ", data);
    if (Array.isArray(data)) {
      setProducts(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } else {
      setProducts([]); // Leeres Array, falls data kein Array ist
      console.error("Erwartetes Array, aber bekommen:", data);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) {
      fetchSeller();
      fetchProducts();
      fetchOrders();
    }
  }, [userId, token, activeTab, fetchSeller, fetchProducts, fetchOrders]);

  useEffect(() => {
    if (userId && token) {
      fetchSeller();
      fetchProducts();
      fetchOrders();
    }
  }, [userId, token, activeTab, fetchSeller, fetchProducts, fetchOrders]);

  if (!seller) return <p>Loading Profile...</p>;

  return (
    <div className="profile-seller-container">
      <Header />
      <ProfileSellerHeader seller = {seller} openOrders = {filteredOpenOrders} orders = {orders}/>
      <nav
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          cursor: "pointer",
          justifyContent: "center",
        }}
      >
        {["products",  "allOrders", "add_new_product"].map(
          (tab) => {
            let label = "";
            if (tab === "products") label = t(`tabs_seller.${tabKeys[0]}`);
            if (tab === "allOrders") label = t(`tabs_seller.${tabKeys[2]}`);
            if (tab === "add_new_product") label = t(t("add_new_product"));

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
          }
        )}
      </nav>
      <div>
        {activeTab === "products" && <SellerProducts products={products} />}
  
        {activeTab === "allOrders" && (
          <SellerOrders
            sellerId={userId}
            handleStatusChange={handleStatusChange}
          />
        )}
        {activeTab === "add_new_product" && <AddProduct />}
      </div>
    </div>
  );
}

export default ProfileSeller;
