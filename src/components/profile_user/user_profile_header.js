import "./user_profile_header.css";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { cities, citiesData } from '../utils/const/cities';
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
    console.log("ProfileHeader user phone", user.phone);
    console.log("ProfileHeader user address", user.address);
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

    const fetchUnreadMessages = async () => {
      const currentUserId = user.userId || user._id;
      if (!currentUserId) return;
      try {
        const resMessages = await fetch(`${apiUrl}/chats/unread/user/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataMessages = await resMessages.json();
        setUnreadMessages(dataMessages.unreadCount || 0);
      } catch (err) {
        console.error("Error fetching unread messages:", err);
      }
    };
    fetchUnreadMessages();
  }, [user, apiUrl, token]);

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

      const res = await fetch(`${apiUrl}/users/${user.userId || user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        if (formData.phone) localStorage.setItem("phone", formData.phone);
        // Similar logic for address, but since it's complex, I'll focus on phone which is requested explicitly 
        // "address of the user and his phone".
        // I will store the address components if possible.
        if (formData.address) {
          const addressObj = {
            address: formData.address,
            city: cityIndex,
            subCity: subCityIndex
          };
          localStorage.setItem("currentAddress", JSON.stringify(addressObj));
        }
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

  const handleLogout = async () => {
    try {
      const currentUserId = user.userId || user._id || localStorage.getItem("userId");
      console.log("Logout requested for userID:", currentUserId);
      console.log("Logout requested for user:", user);

      if (currentUserId) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, role: 1 }),
        });
      }
    } catch (err) {
      console.error("Logout error", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const handleDeleteAccount = () => {
    console.log("Delete account requested for user:", user.userId || user._id);
    toast.info("Delete account functionality is currently disabled (logged to console).");
  };

  return (
    <div className="user-profile-header-container">
      {!user.active && (
        <div className="user-inactive-banner">
          <FaExclamationTriangle />
          <span>
            {t("account_inactive_msg") || "Your account is currently inactive. Please contact admin."}
          </span>
        </div>
      )}

      <div className="user-profile-minimal-card">
        <div className="user-profile-top-row">
          <div className="user-profile-identity">
            <div className="user-avatar-minimal">
              <img src={user.image || '/default-avatar.png'} alt={user.firstName} />
            </div>
            <div className="user-info-minimal">
              <h1 className="user-name-minimal">{user.firstName} {user.lastName}</h1>
              <p className="user-email-minimal">{user.email}</p>

              <div className="user-contact-minimal">
                {user.phone && <span className="contact-pill"><FaPhone size={10} /> {user.phone}</span>}
                {(user.address || user.city) && (
                  <span className="contact-pill">
                    <FaMapMarkerAlt size={10} />
                    {[user.address, citiesData[cities[user.city]][user.subCity], cities[user.city]].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="user-actions-minimal">
            <button className="action-btn-minimal" onClick={() => navigate('/chat')}>
              {t("messages") || "MESSAGES"}
              {unreadMessages > 0 && <span className="badge-count">{unreadMessages}</span>}
            </button>
            <button className="action-btn-minimal" onClick={() => setShowSettings(true)}>
              {t("settings") || "SETTINGS"}
            </button>
            <button className="action-btn-minimal logout" onClick={handleLogout}>
              {t("logout") || "LOGOUT"}
            </button>
          </div>
        </div>

        <div className="user-stats-minimal">
          <div className="stat-item-minimal">
            <span className="stat-value">{totalOrders}</span>
            <span className="stat-label">{t("total_orders") || "Total Orders"}</span>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item-minimal">
            <span className="stat-value">{openOrders}</span>
            <span className="stat-label">{t("open_orders") || "Open Orders"}</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="user-modal-overlay">
          <div className="user-modal-content">
            <div className="user-modal-header">
              <h2>{t("edit_profile") || "Edit Profile"}</h2>
              <button className="user-close-modal-btn" onClick={() => setShowSettings(false)}>&times;</button>
            </div>

            <div className="user-modal-body">
              <div className="user-form-group">
                <label>{t("phone_number") || "Phone Number"}</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="user-form-group">
                <label>{t("street_address") || "Street Address"}</label>
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
                  <label>{t("city") || "City"}</label>
                  <select name="city" value={formData.city} onChange={handleCityChange}>
                    <option value="">{t("select_city") || "Select City"}</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="user-form-group half">
                  <label>{t("subcity") || "SubCity"}</label>
                  <select name="subCity" value={formData.subCity} onChange={handleInputChange}>
                    <option value="">{t("select_subcity") || "Select SubCity"}</option>
                    {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="user-modal-footer">
              <button className="user-delete-account-link" onClick={handleDeleteAccount}>
                <FaTrash /> {t("delete_account") || "Delete Account"}
              </button>
              <div className="user-modal-actions-right">
                <button className="user-cancel-btn" onClick={() => setShowSettings(false)}>{t("cancel") || "Cancel"}</button>
                <button className="user-save-btn" onClick={handleUpdate}>{t("save_changes") || "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileHeader;
