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
        console.log("ProfileSellerHeader unreadCount: ", dataMessages.unreadCount);
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
    <div className="seller-profile-header-container">
      {!seller.active && (
        <div className="seller-inactive-banner">
          <FaExclamationTriangle />
          <span>
            {t("account_inactive_msg") || "Your account is currently inactive. Please contact admin."}
          </span>
        </div>
      )}

      <div className="seller-profile-minimal-card">
        <div className="seller-profile-top-row">
          <div className="seller-profile-identity">
            <div className="seller-avatar-minimal">
              <img src={seller.image || '/default-avatar.png'} alt={seller.shopName} />
            </div>
            <div className="seller-info-minimal">
              <div className="seller-name-row">
                <h1 className="seller-name-minimal">{seller.shopName}</h1>
                <div className="seller-rating-minimal">
                  <FaStar className="star-icon-minimal" />
                  <span>{avgRating}</span>
                  <span className="rating-count">({reviewCount})</span>
                </div>
              </div>
              <p className="seller-email-minimal">{seller.firstName} {seller.lastName}</p>

              <div className="seller-contact-minimal">
                {seller.phone && seller.phone.length > 0 && (
                  <span className="contact-pill">
                    <FaPhone size={10} /> {seller.phone[seller.phone.length - 1].phone}
                  </span>
                )}
                {seller.address && seller.address.length > 0 && (
                  <span className="contact-pill">
                    <FaMapMarkerAlt size={10} />
                    {seller.address[seller.address.length - 1].address},&nbsp;
                    {citiesData[cities[seller.address[seller.address.length - 1].city]][seller.address[seller.address.length - 1].subCity]},&nbsp;
                    {cities[seller.address[seller.address.length - 1].city]}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="seller-actions-minimal">
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

        <div className="seller-stats-minimal">
          <div className="stat-item-minimal">
            <span className="stat-value">{productCount}</span>
            <span className="stat-label">{t("products") || "Products"}</span>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item-minimal">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">{t("total_orders") || "Total Orders"}</span>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item-minimal">
            <span className="stat-value">{stats.openOrders}</span>
            <span className="stat-label">{t("open_orders") || "Open Orders"}</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-content">
            <div className="seller-modal-header">
              <h2>{t("edit_profile") || "Edit Profile"}</h2>
              <button className="seller-close-modal-btn" onClick={() => setShowSettings(false)}>&times;</button>
            </div>

            <div className="seller-modal-body">
              <div className="seller-form-group">
                <label>{t("phone_number") || "Phone Number"}</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="seller-form-group">
                <label>{t("street_address") || "Street Address"}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="seller-form-row">
                <div className="seller-form-group half">
                  <label>{t("city") || "City"}</label>
                  <select name="city" value={formData.city} onChange={handleCityChange}>
                    <option value="">{t("select_city") || "Select City"}</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="seller-form-group half">
                  <label>{t("subcity") || "SubCity"}</label>
                  <select name="subCity" value={formData.subCity} onChange={handleInputChange}>
                    <option value="">{t("select_subcity") || "Select SubCity"}</option>
                    {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="seller-modal-footer">
              <button className="seller-delete-account-link" onClick={handleDeleteAccount}>
                <FaTrash /> {t("delete_account") || "Delete Account"}
              </button>
              <div className="seller-modal-actions-right">
                <button className="seller-cancel-btn" onClick={() => setShowSettings(false)}>{t("cancel") || "Cancel"}</button>
                <button className="seller-save-btn" onClick={handleUpdate}>{t("save_changes") || "Save Changes"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSellerHeader;
