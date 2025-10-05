import React, { useRef, useEffect, useState, useContext } from 'react';
import './header.css';
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Login from '../login/login'; 
import Register from '../register/register'; 
import { FilterContext } from '../filter_context/filter_context';

function Header() {
  const {
    selectedCategory,
    setSelectedCategory,
    handleSearch,
    searchTerm,
    setSearchTerm
  } = useContext(FilterContext);

  const scrollRef = useRef(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const categoryKeys = [
    "womensClothing", "mensClothing", "shoes",
    "womensUnderwear", "mensUnderwear", "bags",
    "kidsClothing", "babyClothing"
  ];

  const handleCategoryClick = (categoryKey) => {
    if (searchTerm) {
      setSearchTerm("");
      handleSearch("");
    }
    setSelectedCategory(categoryKey);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 650;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
      setShowLoginPopup(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleSearchSubmit  = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleHelpClick = () => {
    navigate("/help");
  };

  return (
    <div className="header">
      <nav className="navbar">
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit", fontSize: 40 }}>
            {t("myshop")}
          </Link>
        </h1>

        <form onSubmit={handleSearchSubmit} className="search-form">
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

          {isLoggedIn ? (
            <span onClick={handleProfileClick} className="profile-link">
              {t("profile")}
            </span>
          ) : (
            <span onClick={handleProfileClick} className="login-link">
              {t("login")}
            </span>
          )}

          {isLoggedIn && (
            <span onClick={handleLogout} className="logout-link">
              {t("logout")}
            </span>
          )}

          <button onClick={handleHelpClick} className="help-link">?</button>

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

      <nav className="horizontal-nav">
        <button className="scroll-arrow left" onClick={() => scroll('left')}>‹</button>

        <ul className="nav-scroll-list" ref={scrollRef}>
          <li
            className={`nav-item ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => handleCategoryClick("")}
          >
            {t("home")}
          </li>

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
