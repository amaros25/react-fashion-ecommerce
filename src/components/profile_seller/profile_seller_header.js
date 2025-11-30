import "./profile_seller_header.css";

import React, { useState, useEffect } from "react";
import { cities, citiesData } from '../const/cities';

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
      <div className="profile-left">
        <img src={seller.image} alt={seller.shopName} className="profile-image" />
        <h2 className="shop-name">{seller.shopName}</h2>
        <h3>
          {seller.firstName} {seller.lastName}
        </h3>
        {seller.address && seller.address.length > 0 ? (
          <p>
            {seller.address[seller.address.length - 1].address} &nbsp;
            {citiesData[cities[seller.address[seller.address.length - 1].city]][seller.address[seller.address.length - 1].subCity]} &nbsp;
            {cities[seller.address[seller.address.length - 1].city]}
          </p>
        ) : (
          <p>No address available</p>
        )}
        <p>{seller.email}</p>
        {seller.phone && seller.phone.length > 0 ? (
          <p>{seller.phone[seller.phone.length - 1].phone}</p>
        ) : (
          <p>No phone available</p>
        )}
      </div>
      <div className="right-content">
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
