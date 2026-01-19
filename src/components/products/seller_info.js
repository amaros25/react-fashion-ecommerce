
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { cities, citiesData } from '../utils/const/cities';
import "./seller_info.css";

function SellerInfo({ seller }) {
  if (!seller) return null;

  const reviewCount = seller.stats?.reviewCount || 0;
  const averageRating = seller.stats?.averageRating || 0;
  const sellerImage = seller.image || '/default-avatar.png';
  const cityName = cities ? cities[seller.city] : null;
  const SellerSubCity = (cityName && citiesData && citiesData[cityName])
    ? citiesData[cityName][seller.subCity]
    : seller.subCity;
  const sellerCity = cityName || " ";

  return (
    <div className="seller-info-card">
      {sellerImage && (
        <img
          src={sellerImage}
          alt={seller.shopName || "Shop"}
          className="seller-card-image"
          loading="lazy"
        />
      )}
      <div className="seller-card-details">
        <div className="seller-name-rating">
          <h3 className="seller-card-name">{seller.shopName || "Shop"}</h3>
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
