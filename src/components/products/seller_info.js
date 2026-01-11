import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./seller_info.css";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { cities, citiesData } from '../utils/const/cities';

function SellerInfo({ seller }) {
  if (!seller) return null;
  const reviewCount = seller.reviewCount || 0;
  const averageRating = seller.averageRating || 0;
  let sellerImage = "";
  if (seller.image && seller.image.length > 0) {
    sellerImage = seller.image[seller.image.length - 1].imageUrl;
  }

  let sellerCity = "";
  let SellerSubCity = "";
  if (Array.isArray(seller.address) && seller.address.length > 0) {
    seller.address = seller.address[seller.address.length - 1];
    sellerCity = cities[seller.address.city];
    SellerSubCity = citiesData[cities[seller.address.city]][seller.address.subCity]
  } else {
    sellerCity = cities[seller.address.city];
    SellerSubCity = citiesData[cities[seller.address.city]][seller.address.subCity]
    console.log("Seller Info: ", sellerCity, SellerSubCity)
  }
  ;
  return (
    <div className="seller-info-card">
      {sellerImage && (
        <img
          src={sellerImage}
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
          <div className="seller-card-location">
            <FaMapMarkerAlt className="location-icon" />
            <span>
              {SellerSubCity},&nbsp;
              {sellerCity}
            </span>
          </div>
        </div>
      </div>
    </div >
  );
}

export default SellerInfo;
