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
        {/*
     
        <div className="order-chart-card">
          <h4>Orders Over Time</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={ordersByMonthWithStatus}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#555" />
              <YAxis stroke="#555" allowDecimals={false} domain={[0, "dataMax + 2"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
      
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="pending" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="cancelled" stroke="#ff66b2" strokeWidth={3} dot={false} />

              <Line type="monotone" dataKey="delivered" stroke="#4caf50" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="returned_to_sender" stroke="#b71c1c" strokeWidth={3} dot={false} />

            </LineChart>
          </ResponsiveContainer>
            <div className="order-legend">
            <div><span className="dot total"></span> Total</div>
            <div><span className="dot pending"></span> Pending</div>
            <div><span className="dot cancelled"></span> Cancelled</div>
            <div><span className="dot delivered"></span> Delivered</div>
            <div><span className="dot returned"></span> Returned</div>
            </div>
        
        </div>
    */}
      </div>
    </div>
  );
}

export default ProfileSellerHeader;
