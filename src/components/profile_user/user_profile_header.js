import React from "react";
import "./user_profile_header.css";
import { FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function ProfileHeader({ user, totalOrders, openOrders }) {
  const {t} = useTranslation();
  return (
    <div className="profile-header-container">
      <div className="profile-cards-container">
        <div className="profile-card">
        <div className="profile-avatar">
          {user.image ? (
            <img src={user.image} alt={user.firstName} className="profile-image" />
          ) : (
            <FaUserCircle className="default-avatar-icon" />
          )}
        </div>
        <h2 className="profile-name">{user.firstName} {user.lastName}</h2>
      </div>
        <div className="profile-card">
          {user.phone && (
            <p className="profile-card-line">
              <strong className="profile-card-label">{t("phone")}:</strong>
              <span className="profile-card-value">{user.phone}</span>
            </p>
          )}
          <p className="profile-card-line">
            <strong className="profile-card-label">{t("email")}:</strong>
            <span className="profile-card-value">{user.email}</span>
          </p>
          {user.address && (
            <p className="profile-card-line">
              <strong className="profile-card-label">{t("address")}:</strong>
              <span className="profile-card-value">{user.address.street}, {user.address.postalCode} {user.address.city}</span>
            </p>
          )}
        </div>
        <div className="profile-card">
          <h4>{t("total_orders")}</h4>
          <p>{totalOrders}</p>
        </div>
        <div className="profile-card">
          <h4>{t("open_orders")}</h4>
          <p>{openOrders}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
