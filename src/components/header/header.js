import React, { useRef, useEffect, useState } from 'react';
import './header.css';
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Header() {
  const { t, i18n } = useTranslation(); // ✅ Hook IN der Komponente
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);




  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      navigate(role === "seller" ? "/profile_seller" : "/profile_user");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };


  // 🔹 Sprachwechsel
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="header">
      {/* Top navigation bar */}
      <nav className="navbar">
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            {t("myshop")}
          </Link>
        </h1>

        <div className="links">
          {/* Home als Link mit React Router */}
          <Link to="/">{t("home")}</Link>

          {/* Profile als Button/Span */}
          <span onClick={handleProfileClick} className="profile-link">{t("profile")}</span>

          {/* Login / Logout */}
          {isLoggedIn ? (
            <span onClick={handleLogout} className="logout-link">{t("logout")}</span>
          ) : (
            <Link to="/login" className="login-link">{t("login")}</Link>
          )}

          {/* Sprachumschalter */}
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            style={{ marginLeft: '15px', marginTop:'10px', cursor: 'pointer' }}
          >
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </nav>


    </div>
  );
}

export default Header;
