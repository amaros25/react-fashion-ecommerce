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

  useEffect(() => {
      if (i18n.language === 'ar') {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    }, [i18n.language]);

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
    <div className="header" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
    <div className="header">
      <nav className="navbar">
        <h1 className="logo">
          <Link to="/"  >
            {t("myshop")}
          </Link>
        </h1>
        <div className="links">
          <Link to="/">
            <img src="/icons/home_icon.svg" style={{ width: "26px", height: "35px" }} />
          </Link>
          <Link to="/cart_page">
            <img src="/icons/empty_cart_icon.svg" style={{ width: "26px", height: "35px" }} />
          </Link>
      {isLoggedIn ? (
            <img src="/icons/profile_icon.svg"
              style={{ width: "24px", height: "50px"}}  
              className="nav-icon"
              onClick={handleProfileClick}
            />
          ) : (
             <img src="/icons/login_icon.svg"
              style={{ width: "24px", height: "24px" }} 
              alt="Login"
              className="nav-icon"
              onClick={handleProfileClick}
            />
          )}
          {isLoggedIn && (
            <img src="/icons/logout_icon.svg"
              style={{ width: "24px", height: "24px" }}  
              className="nav-icon"
              onClick={handleLogout}
            />
          )}
          {/*
          <img src="/icons/help_icon.svg"
            style={{ width: "24px", height: "24px" }}  
            className="nav-icon"
            onClick={handleHelpClick}
          />
            */}
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
      <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder={t("search_product")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">{t("search")}</button>
        </form>

      <nav className="horizontal-nav">
        <button className="scroll-arrow left" onClick={() => scroll('left')}>‹</button>
        <ul className="nav-scroll-list" ref={scrollRef}>
          <li
            className={`nav-item ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => handleCategoryClick("")}>
            {t("home")}
          </li>
          {categoryKeys.map((key, index) => (
            <li
              key={index}
              className={`nav-item ${selectedCategory === key ? "active" : ""}`}
              onClick={() => handleCategoryClick(key)}>
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
    </div>
  );
}
export { Header };
