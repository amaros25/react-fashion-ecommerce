import React from "react";
import "./user_profile_header.css";
import { FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function ProfileHeader({ user, totalOrders, openOrders }) {
  const { t } = useTranslation(); // hook für Übersetzungen

  return (
    <div className="profile-header-container">
      {/* Links: Avatar + Name */}
      <div className="profile-left">
        <div className="profile-avatar">
          {user.image ? (
            <img src={user.image} alt={user.firstName} className="profile-image" />
          ) : (
            <FaUserCircle className="default-avatar-icon" />
          )}
        </div>
        <h2 className="profile-name">{user.firstName} {user.lastName}</h2>
      </div>

      {/* Rechts: Drei Cards */}
      <div className="profile-cards-container">
        {/* Kontakt Info */}
        <div className="profile-card">
          <p><strong>{t("email")}:</strong> {user.email}</p>
          {user.phone && <p><strong>{t("phone")}:</strong> {user.phone}</p>}
          {user.address && (
            <p>
              <strong>{t("address")}:</strong> {user.address.street}, {user.address.postalCode} {user.address.city}
            </p>
          )}
        </div>

        {/* Total Orders */}
        <div className="profile-card">
          <h4>{t("total_orders")}</h4>
          <p>{totalOrders}</p>
        </div>

        {/* Open Orders */}
        <div className="profile-card">
          <h4>{t("open_orders")}</h4>
          <p>{openOrders}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
