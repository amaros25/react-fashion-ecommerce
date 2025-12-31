import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./seller_info.css";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { cities, citiesData } from '../utils/const/cities';

function SellerInfo({ seller }) {
  if (!seller) return null;
  const reviewCount = seller.reviewCount || 0;
  const averageRating = seller.averageRating || 0;

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
        <div className="seller-name-rating">
          <h3 className="seller-card-name">{seller.shopName}</h3>
          <div className="seller-rating-container">
            <div className="seller-rating">
              {[1, 2, 3, 4, 5].map((star) => {
                const diff = averageRating - (star - 1);
                let StarIcon;
                if (diff >= 1) {
                  StarIcon = FaStar;
                } else if (diff >= 0.5) {
                  StarIcon = FaStarHalfAlt;
                } else {
                  StarIcon = FaRegStar;
                }
                return (
                  <StarIcon
                    key={star}
                    className="star"
                    size={22}
                    color={diff >= 0.5 ? "#ffc107" : "#e4e5e9"}
                  />
                );
              })}
            </div>
            <span className="seller-review-count">({reviewCount})</span>
          </div>
        </div>
        <div className="seller-card-meta">
          <span className="seller-card-owner">{seller.firstName} {seller.lastName}</span>
          <div className="seller-card-location">
            <FaMapMarkerAlt className="location-icon" />
            {seller.address && seller.address.length > 0 ? (
              <span>
                {citiesData[cities[seller.address[seller.address.length - 1].city]][seller.address[seller.address.length - 1].subCity]},&nbsp;
                {cities[seller.address[seller.address.length - 1].city]}
              </span>
            ) : (
              <span>No address set</span>
            )}
          </div>

        </div>
      </div>
    </div >
  );
}

export default SellerInfo;
