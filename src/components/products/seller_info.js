import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./seller_info.css";

function SellerInfo({ seller }) {
  if (!seller) return null;
  return (
    <div className="seller-info-card">
      {seller.image && (
        <img
          src={seller.image}
          alt={seller.shopName}
          className="seller-card-image"
          loading="lazy"
        />
      )}
      <div className="seller-card-details">
        <h3 className="seller-card-name">{seller.shopName}</h3>
        <div className="seller-card-meta">
          <span className="seller-card-owner">{seller.firstName} {seller.lastName}</span>
          <div className="seller-card-location">
            <FaMapMarkerAlt className="location-icon" />
            <span>{seller.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerInfo;
