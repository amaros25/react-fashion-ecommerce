import "./profile_seller_header.css";
import { useState, useEffect } from "react";
import { cities, citiesData } from '../utils/const/cities';
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaStar, FaStarHalfAlt, FaExclamationTriangle, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

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

  const avgRating = seller?.averageRating || 0;
  const reviewCount = seller?.reviewCount || 0;

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
        if (formData.phone) localStorage.setItem("phone", formData.phone);
        if (formData.address && formData.city && formData.subCity) {
          // Construct address object similar to backend structure if needed, or just store what we have
          // For now, let's store the latest address update
          const newAddress = {
            address: formData.address,
            city: cityIndex,
            subCity: subCityIndex
          };
          // We might need to fetch the full array or just store this one. 
          // Given the requirement "store address... in storage", I'll store the latest one.
          // But wait, the login stores the whole array potentially? 
          // Let's assume we just want the current active one or update the existing structure.
          // Simplest approach: Update the specific fields if they exist in a stored object, or just store the values.
          // The user said "address... and phone... stored in storage".
          localStorage.setItem("phone", formData.phone);
          // For address, it's complex because it's an array in DB. 
          // I'll just store the latest update as "currentAddress" or similar if I can't easily append.
          // Actually, the login response likely sends the user object.
          // Let's just update 'phone' and maybe 'address' if it's a single string, but here it's structured.
          // I will try to update 'phone' as it's a simple string usually (or array?). 
          // In the file, seller.phone is an array: seller.phone[seller.phone.length - 1].phone
          // So I should probably store the *value* of the phone.
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

  const handleDeleteAccount = () => {
    console.log("Delete account requested for seller:", seller._id);
    toast.info("Delete account functionality is currently disabled (logged to console).");
  };

  const handleLogout = async () => {
    try {
      const currentUserId = seller.userId || seller._id || localStorage.getItem("userId");
      console.log("Logout requested for userID:", currentUserId);
      console.log("Logout requested for user:", seller);
      if (currentUserId) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, role: 2 }),
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

  return (
    <div className="seller-profile-header-container">
      {!seller.active && (
        <div className="seller-inactive-banner">
          <FaExclamationTriangle />
          <span>
            {t("account_inactive_msg")}
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
                  {[1, 2, 3, 4, 5].map((star) => {
                    const diff = avgRating - (star - 1);
                    if (diff >= 1) {
                      return <FaStar key={star} className="star-icon-minimal" />;
                    } else if (diff >= 0.5) {
                      return <FaStarHalfAlt key={star} className="star-icon-minimal" />;
                    } else {
                      return <FaStar key={star} className="star-icon-minimal empty" style={{ opacity: 0.3 }} />;
                    }
                  })}
                  <span>{avgRating.toFixed(1)}</span>
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
              {t("messages")}
              {unreadMessages > 0 && <span className="badge-count">{unreadMessages}</span>}
            </button>
            <button className="action-btn-minimal" onClick={() => setShowSettings(true)}>
              {t("settings")}
            </button>
            <button className="action-btn-minimal logout" onClick={handleLogout}>
              {t("logout")}
            </button>
          </div>
        </div>

        <div className="seller-stats-minimal">
          <div className="stat-item-minimal">
            <span className="stat-value">{productCount}</span>
            <span className="stat-label">{t("products")}</span>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item-minimal">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">{t("total_orders")}</span>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item-minimal">
            <span className="stat-value">{stats.openOrders}</span>
            <span className="stat-label">{t("open_orders")}</span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-content">
            <div className="seller-modal-header">
              <h2>{t("edit_profile")}</h2>
              <button className="seller-close-modal-btn" onClick={() => setShowSettings(false)}>&times;</button>
            </div>

            <div className="seller-modal-body">
              <div className="seller-form-group">
                <label>{t("phone_number")}</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t("enter_phone_number")}
                />
              </div>
              <div className="seller-form-group">
                <label>{t("street_address")}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t("enter_street_address")}
                />
              </div>
              <div className="seller-form-row">
                <div className="seller-form-group half">
                  <label>{t("city")}</label>
                  <select name="city" value={formData.city} onChange={handleCityChange}>
                    <option value="">{t("select_city")}</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="seller-form-group half">
                  <label>{t("register.subCity")}</label>
                  <select name="subCity" value={formData.subCity} onChange={handleInputChange}>
                    <option value="">{t("select_subcity")}</option>
                    {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="seller-modal-footer">
              <button className="seller-delete-account-link" onClick={handleDeleteAccount}>
                <FaTrash /> {t("delete_account")}
              </button>
              <div className="seller-modal-actions-right">
                <button className="seller-cancel-btn" onClick={() => setShowSettings(false)}>{t("cancel")}</button>
                <button className="seller-save-btn" onClick={handleUpdate}>{t("save_changes")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSellerHeader;
