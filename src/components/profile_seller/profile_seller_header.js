import "./profile_seller_header.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import React, { useState, useEffect } from "react";

function ProfileSellerHeader({ seller, apiUrl, token }) {

  const [stats, setStats] = useState({ openOrders: 0, totalOrders: 0 });
useEffect(() => {
    if (!seller?._id) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiUrl}/orders/stats/${seller._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Fehler beim Laden der Stats:", err);
      }
    };

    fetchStats();
  }, [seller, apiUrl, token]);

  return (
    <div className="profile-header">
      {/* Linke Profilseite */}
      <div className="profile-left">
        <img src={seller.image} alt={seller.shopName} className="profile-image" />
        <h2 className="shop-name">{seller.shopName}</h2>
        <h3>
          {seller.firstName} {seller.lastName}
        </h3>
        <p>{seller.address}</p>
        <p>{seller.email}</p>
        <p>{seller.phone}</p>
      </div>
      {/* Rechte Seite (eigene Cards, nicht verschachtelt) */}
      <div className="right-content">
        {/* === Orders Card === */}
        <div className="order-stats-card">
          <div className="stat-item">
            <h4>Open Orders</h4>
            <p className="stat-number">{2}</p>
          </div>
          <div className="stat-item">
            <h4>Total Orders</h4>
            <p className="stat-number">{3}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSellerHeader;
