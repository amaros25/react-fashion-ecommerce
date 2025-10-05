import React, { useState, useEffect, useCallback } from "react";

import SellerOpenOrders from './seller_open_orders.js';
import Header from '../header/header.js';
import { useNavigate } from "react-router-dom";
import "./profile_seller.css";
import { useTranslation } from "react-i18next";
import AddProduct from "../new_product/add_product"

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
          "Authorization": `Bearer ${token}`,
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

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`${apiUrl}/products/seller/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setProducts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } else {
      setProducts([]);  // Leeres Array, falls data kein Array ist
      console.error("Erwartetes Array, aber bekommen:", data);
    }
  }, [userId, token]);

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`${apiUrl}/orders/seller/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      const openOrdersList = data.filter(order => 
        order.status.length <=2 && 
        (order.status[0].update === "pending" || order.status[0].update === "confirmed")
      );
      setFilteredOpenOrders(openOrdersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }else{
      setOrders([]);  // Leeres Array, falls data kein Array ist
      setFilteredOpenOrders([]);  // Leeres Array, falls data kein Array ist
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
 
      <div className="profile-header">
        <div className="profile-left">
          <img src={seller.image} alt={seller.shopName} className="profile-image" />
          <h2 className="shop-name">{seller.shopName}</h2>
        </div>
        <div className="profile-info">
          <h3>{seller.firstName} {seller.lastName}</h3>
          <p>{seller.address}</p>
          <p>{seller.email}</p>
        </div>
        <div className="shop-info">
     
        </div>
      </div>
        
      <nav style={{ display: "flex", gap: "20px", marginBottom: "20px", cursor: "pointer", justifyContent: "center" }}>
        {["products", "openOrders", "allOrders", "add_new_product"].map(tab => {
          let label = "";
          
          if (tab === "products") label = t(`tabs_seller.${tabKeys[0]}`);
          if (tab === "openOrders") label = t(`tabs_seller.${tabKeys[1]}`);
          if (tab === "allOrders") label = t(`tabs_seller.${tabKeys[2]}`);
          if (tab === "add_new_product") label = t(t("add_new_product"));

          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                borderBottom: activeTab === tab ? "3px solid #007bff" : "3px solid transparent",
                fontWeight: activeTab === tab ? "bold" : "normal",
                color: activeTab === tab ? "#007bff" : "#555",
                transition: "all 0.3s ease",
                userSelect: "none"
              }}
            >
              {label}
            </div>
          );
        })}
      </nav>
      <div>
        {activeTab === "products" && (
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div className="product-list" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
              padding: "20px",
            }}>
              {products.map(product => (
                <div key={product._id} className="product-card" style={{
                  backgroundColor: "#fff",
                  padding: "15px",
                  borderRadius: "10px",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}>
                  <img src={product.image[0]} alt={product.name} style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }} />
                  <h4 style={{ margin: "10px 0 5px" }}>{product.name}</h4>
                  <p style={{ margin: "5px 0", color: "#555" }}>Price: €{product.price}</p>
                  <p style={{ margin: "5px 0", color: "#777" }}>Published: {new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "openOrders" && (
          <SellerOpenOrders orders={filteredOpenOrders} handleStatusChange={handleStatusChange} />
        )}

        {activeTab === "allOrders" && (
          <SellerOpenOrders orders={orders} handleStatusChange={handleStatusChange} />
        )}
        {activeTab === "add_new_product" && (
          <AddProduct/>
        )}

      </div>
    </div>
  );
}

export default ProfileSeller;
