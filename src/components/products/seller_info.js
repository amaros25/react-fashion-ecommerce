import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./seller_info.css"; // eigene CSS-Datei

function SellerInfo({ seller }) {
  if (!seller) return null;

  return (
    <div className="seller-info">
      <div className="seller-details">
        {seller.image && (
          <img
            src={seller.image}
            alt={seller.shopName}
            className="seller-image"
            loading="lazy"
          />
        )}
        <div>
          <h3 className="seller-name">{seller.shopName}</h3>
 

          <div className="seller-city">
            <FaMapMarkerAlt className="city-icon" />
            <span>{seller.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerInfo;
