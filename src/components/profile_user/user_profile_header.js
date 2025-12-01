import "./user_profile_header.css";
import React, { useState, useEffect } from "react";
import { cities, citiesData } from '../const/cities';
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt, FaTrash, FaShoppingBag, FaExclamationTriangle, FaCommentDots, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

function ProfileHeader({ user, totalOrders, openOrders }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const [showSettings, setShowSettings] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    subCity: "",
    phone: ""
  });
  const [subCities, setSubCities] = useState([]);

  useEffect(() => {
    // Initialize form data from user
    if (user.address) {


      setFormData(prev => ({
        ...prev,
        address: user.address,
        city: cities[user.city],
        subCity: citiesData[cities[user.city]]?.[user.subCity] || ""
      }));
      if (cities[user.city]) {
        setSubCities(citiesData[cities[user.city]] || []);
      }
    }
    if (user.phone) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone
      }));
    }
  }, [user]);

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

      const res = await fetch(`${apiUrl}/users/${user._id}`, {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const handleDeleteAccount = () => {
    console.log("Delete account requested for user:", user._id);
    toast.info("Delete account functionality is currently disabled (logged to console).");
  };

  return (
    <div className="user-profile-header-container">
      {!user.active && (
        <div className="user-inactive-banner">
          <FaExclamationTriangle />
          <span>
            Your account is currently inactive. Please contact the admin to reactivate your account.
            You cannot place orders or chat with sellers.
          </span>
        </div>
      )}

      <div className="user-profile-header-card">
        <div className="user-profile-cover">
          <div className="user-cover-pattern"></div>
          <div className="user-cover-gradient"></div>
        </div>

        <div className="user-profile-content-wrapper">
          <div className="user-profile-main-section">
            <div className="user-profile-image-wrapper">
              <div className="user-profile-image-container">
                <img src={user.image || '/default-avatar.png'} alt={user.firstName} className="user-profile-image" />
              </div>
              <div className="user-status-indicator"></div>
            </div>

            <div className="user-profile-info-block">
              <h1 className="user-name">{user.firstName} {user.lastName}</h1>
              <p className="user-email">{user.email}</p>

              <div className="user-contact-info-grid">
                <div className="user-contact-item">
                  <FaMapMarkerAlt className="user-contact-icon" />
                  {user.address && user.city ? (
                    <span>
                      {user.address},{user.subCity && ` ${user.subCity},`} {user.city}
                    </span>
                  ) : (
                    <span>{t("cart_page.no_address_set")}</span>
                  )}
                </div>
                <div className="user-contact-item">
                  <FaPhone className="user-contact-icon" />
                  {user.phone ? (
                    <span>{user.phone}</span>
                  ) : (
                    <span>{t("cart_page.no_phone_set")}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="user-profile-actions-section">
            <button className="user-action-btn messenger-btn" onClick={() => navigate('/chat')}>
              <div className="icon-wrapper">
                <FaCommentDots />
                {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
              </div>
              Messages
            </button>
            <button className="user-action-btn settings-btn" onClick={() => setShowSettings(true)}>
              <FaCog /> Settings
            </button>
            <button className="user-action-btn logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        <div className="user-stats-dashboard">
          <div className="user-stat-box">
            <div className="user-stat-icon-circle green">
              <FaShoppingBag />
            </div>
            <div className="user-stat-details">
              <span className="user-stat-number">{totalOrders}</span>
              <span className="user-stat-label">Total Orders</span>
            </div>
          </div>
          <div className="user-stat-box">
            <div className="user-stat-icon-circle orange">
              <FaExclamationTriangle />
            </div>
            <div className="user-stat-details">
              <span className="user-stat-number">{openOrders}</span>
              <span className="user-stat-label">Open Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="user-modal-overlay">
          <div className="user-modal-content">
            <div className="user-modal-header">
              <h2>Edit Profile Settings</h2>
              <button className="user-close-modal-btn" onClick={() => setShowSettings(false)}>&times;</button>
            </div>

            <div className="user-modal-body">
              <div className="user-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="user-form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="user-form-row">
                <div className="user-form-group half">
                  <label>City</label>
                  <select name="city" value={formData.city} onChange={handleCityChange}>
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="user-form-group half">
                  <label>SubCity</label>
                  <select name="subCity" value={formData.subCity} onChange={handleInputChange}>
                    <option value="">Select SubCity</option>
                    {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="user-modal-footer">
              <button className="user-delete-account-link" onClick={handleDeleteAccount}>
                <FaTrash /> Delete Account
              </button>
              <div className="user-modal-actions-right">
                <button className="user-cancel-btn" onClick={() => setShowSettings(false)}>Cancel</button>
                <button className="user-save-btn" onClick={handleUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileHeader;
