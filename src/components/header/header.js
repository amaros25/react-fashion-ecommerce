import React, { useRef, useEffect, useState } from 'react';
import './header.css';
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Login from '../login/login'; 
import Register from '../register/register'; 

function Header({ selectedCategory, setSelectedCategory, onSearch }) {
  const scrollRef = useRef(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State to check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Search input state
  const [searchTerm, setSearchTerm] = useState("");
  // Control visibility of login/register popup
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // Whether the popup shows register form
  const [isRegistering, setIsRegistering] = useState(false);

  // Categories shown in the horizontal navigation bar
  const categoryKeys = [
    "womensClothing",
    "mensClothing",
    "shoes",
    "womensUnderwear",
    "mensUnderwear",
    "bags",
    "kidsClothing",
    "babyClothing"
  ];

  // Handle category click
  const handleCategoryClick = (categoryKey) => {
    if (searchTerm) {
      // Clear search if active
      setSearchTerm("");
      onSearch("");
    }
    setSelectedCategory(categoryKey);
  };

  // Scroll horizontal category list left or right
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 650;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth' // Smooth scrolling
      });
    }
  };

  // Check if user is logged in by presence of token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Handle profile link click
  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      // Navigate to profile depending on user role
      navigate(role === "seller" ? "/profile_seller" : "/profile_user");
    } else {
      // Show login popup if not logged in
      setShowLoginPopup(true);
    }
  };

  // Logout user: clear storage and redirect to home
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  // Change app language and adjust text direction (ltr/rtl)
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Submit search form
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  // Navigate to help page
  const handleHelpClick = () => {
    navigate("/help");
  };

  return (
    <div className="header">
      <nav className="navbar">
        {/* Logo linking to homepage */}
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit", fontSize: 40 }}>
            {t("myshop")}
          </Link>
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder={t("search_product")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">{t("search")}</button>
        </form>

        <div className="links">
          <Link to="/">{t("home")}</Link>

          {/* Show profile link if logged in, otherwise login link */}
          {isLoggedIn ? (
            <span onClick={handleProfileClick} className="profile-link">
              {t("profile")}
            </span>
          ) : (
            <span onClick={handleProfileClick} className="login-link">
              {t("login")}
            </span>
          )}

          {/* Show logout link only if logged in */}
          {isLoggedIn && (
            <span onClick={handleLogout} className="logout-link">
              {t("logout")}
            </span>
          )}

          {/* Help button */}
          <button onClick={handleHelpClick} className="help-link">?</button>

          {/* Language selector */}
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            style={{ marginLeft: '15px', marginTop: '10px', cursor: 'pointer' }}
          >
            <option value="fr">Fr</option>
            <option value="ar">Ar</option>
          </select>
        </div>
      </nav>

      {/* Horizontal category navigation with scroll buttons */}
      <nav className="horizontal-nav">
        <button className="scroll-arrow left" onClick={() => scroll('left')}>‹</button>

        <ul className="nav-scroll-list" ref={scrollRef}>
          {/* Home category */}
          <li
            className={`nav-item ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => handleCategoryClick("")}
          >
            {t("home")}
          </li>

          {/* Render all categories */}
          {categoryKeys.map((key, index) => (
            <li
              key={index}
              className={`nav-item ${selectedCategory === key ? "active" : ""}`}
              onClick={() => handleCategoryClick(key)}
            >
              {t(`categories.${key}`)}
            </li>
          ))}
        </ul>

        <button className="scroll-arrow right" onClick={() => scroll('right')}>›</button>
      </nav>

      {/* Login/Register popup */}
      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={() => setShowLoginPopup(false)}>
          <div className="login-popup-content" onClick={(e) => e.stopPropagation()}>
            {isRegistering ? (
              <Register
                closePopup={() => setShowLoginPopup(false)}
                switchToLogin={() => setIsRegistering(false)}
              />
            ) : (
              <Login
                closePopup={() => setShowLoginPopup(false)}
                switchToRegister={() => setIsRegistering(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { Header };
