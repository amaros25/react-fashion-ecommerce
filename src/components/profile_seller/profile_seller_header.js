import "./profile_seller_header.css";
import React, { useState, useEffect } from "react";
import { cities, citiesData } from '../const/cities';
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt, FaTrash, FaStar, FaBoxOpen, FaShoppingBag, FaExclamationTriangle, FaMapMarkerAlt, FaPhone, FaCommentDots } from 'react-icons/fa';

function ProfileSellerHeader({ seller, apiUrl, token }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ openOrders: 0, totalOrders: 0 });
  const [productCount, setProductCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    subCity: "",
    phone: ""
  });
  const [subCities, setSubCities] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Calculate average rating
  const calculateRating = () => {
    if (!seller.reviews || seller.reviews.length === 0) return { average: 0, count: 0 };
    const total = seller.reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      average: (total / seller.reviews.length).toFixed(1),
      count: seller.reviews.length
    };
  };

  const { average: avgRating, count: reviewCount } = calculateRating();

  useEffect(() => {
    if (!seller?._id) return;

    const fetchStats = async () => {
      try {
        // Fetch Order Stats
        const resOrders = await fetch(`${apiUrl}/orders/stats/${seller._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataOrders = await resOrders.json();
        setStats(dataOrders);

        // Fetch Product Count
        const resProducts = await fetch(`${apiUrl}/products/seller/${seller._id}?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataProducts = await resProducts.json();
        setProductCount(dataProducts.totalCount || 0);

        // Fetch Unread Messages Count
        const resMessages = await fetch(`${apiUrl}/chats/unread/seller/${seller._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataMessages = await resMessages.json();
        setUnreadMessages(dataMessages.unreadCount || 0);

      } catch (err) {
        console.error("Fehler beim Laden der Stats:", err);
      }
    };

    fetchStats();

    // Initialize form data
    if (seller.address && seller.address.length > 0) {
      const lastAddress = seller.address[seller.address.length - 1];
      setFormData(prev => ({
        ...prev,
        address: lastAddress.address,
        city: cities[lastAddress.city],
        subCity: citiesData[cities[lastAddress.city]]?.[lastAddress.subCity] || ""
      }));
      if (cities[lastAddress.city]) {
        setSubCities(citiesData[cities[lastAddress.city]] || []);
      }
    }
    if (seller.phone && seller.phone.length > 0) {
      setFormData(prev => ({
        ...prev,
        phone: seller.phone[seller.phone.length - 1].phone
      }));
    }

  }, [seller, apiUrl, token]);

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFormData({ ...formData, city: cityName, subCity: "" });
    setSubCities(citiesData[cityName] || []);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const cityIndex = cities.indexOf(formData.city);
      const subCityIndex = citiesData[formData.city]?.indexOf(formData.subCity);

      const payload = {};
      if (formData.address && formData.city && formData.subCity) {
        payload.address = {
          address: formData.address,
          city: cityIndex,
          subCity: subCityIndex
        };
      }
      if (formData.phone) {
        payload.phone = formData.phone;
      }

      const res = await fetch(`${apiUrl}/sellers/${seller._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        setShowSettings(false);
        window.location.reload();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred");
    }
  };

  const handleDeleteAccount = () => {
    console.log("Delete account requested for seller:", seller._id);
    toast.info("Delete account functionality is currently disabled (logged to console).");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="profile-header-container">
      {!seller.active && (
        <div className="inactive-banner">
          <FaExclamationTriangle />
          <span>
            Your account is currently inactive. Please contact the admin to reactivate your account.
            You cannot post products or manage orders.
          </span>
        </div>
      )}

      <div className="profile-header-card">
        <div className="profile-cover">
          <div className="cover-pattern"></div>
          <div className="cover-gradient"></div>
        </div>

        <div className="profile-content-wrapper">
          <div className="profile-main-section">
            <div className="profile-image-wrapper">
              <div className="profile-image-container">
                <img src={seller.image} alt={seller.shopName} className="profile-image" />
              </div>
              <div className="status-indicator"></div>
            </div>

            <div className="profile-info-block">
              <div className="shop-title-row">
                <h1 className="shop-name">{seller.shopName}</h1>
                <div className="rating-badge">
                  <FaStar className="star-icon" />
                  <span className="rating-score">{avgRating}</span>
                  <span className="rating-total">({reviewCount})</span>
                </div>
              </div>

              <p className="seller-fullname">{seller.firstName} {seller.lastName}</p>

              <div className="contact-info-grid">
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  {seller.address && seller.address.length > 0 ? (
                    <span>
                      {seller.address[seller.address.length - 1].address},&nbsp;
                      {citiesData[cities[seller.address[seller.address.length - 1].city]][seller.address[seller.address.length - 1].subCity]},&nbsp;
                      {cities[seller.address[seller.address.length - 1].city]}
                    </span>
                  ) : (
                    <span>No address set</span>
                  )}
                </div>
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  {seller.phone && seller.phone.length > 0 ? (
                    <span>{seller.phone[seller.phone.length - 1].phone}</span>
                  ) : (
                    <span>No phone set</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions-section">
            <button className="action-btn messenger-btn" onClick={() => navigate('/chat')}>
              <div className="icon-wrapper">
                <FaCommentDots />
                {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
              </div>
              Messages
            </button>
            <button className="action-btn settings-btn" onClick={() => setShowSettings(true)}>
              <FaCog /> Settings
            </button>
            <button className="action-btn logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        <div className="stats-dashboard">
          <div className="stat-box">
            <div className="stat-icon-circle blue">
              <FaBoxOpen />
            </div>
            <div className="stat-details">
              <span className="stat-number">{productCount}</span>
              <span className="stat-label">Products</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-circle green">
              <FaShoppingBag />
            </div>
            <div className="stat-details">
              <span className="stat-number">{stats.totalOrders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-circle orange">
              <FaExclamationTriangle />
            </div>
            <div className="stat-details">
              <span className="stat-number">{stats.openOrders}</span>
              <span className="stat-label">Open Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Profile Settings</h2>
              <button className="close-modal-btn" onClick={() => setShowSettings(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>City</label>
                  <select name="city" value={formData.city} onChange={handleCityChange}>
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group half">
                  <label>SubCity</label>
                  <select name="subCity" value={formData.subCity} onChange={handleInputChange}>
                    <option value="">Select SubCity</option>
                    {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="delete-account-link" onClick={handleDeleteAccount}>
                <FaTrash /> Delete Account
              </button>
              <div className="modal-actions-right">
                <button className="cancel-btn" onClick={() => setShowSettings(false)}>Cancel</button>
                <button className="save-btn" onClick={handleUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSellerHeader;
