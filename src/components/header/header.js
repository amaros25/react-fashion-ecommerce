import React, { useRef, useEffect, useState, useContext } from 'react';
import './header.css';
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Login from '../login/login';
import Register from '../register/register';
import { FilterContext } from '../filter_context/filter_context';

function Header() {

  const location = useLocation(); // Used to detect the current page path
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const scrollRef = useRef(null);

  // Access shared search & filter states from context
  const {
    selectedCategory,
    setSelectedCategory,
    handleSearch,
    searchTerm,
    setSearchTerm
  } = useContext(FilterContext);

  // UI-related states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState(null);

  // All available product category keys
  const categoryKeys = [
    "womensClothing", "mensClothing", "shoes",
    "womensUnderwear", "mensUnderwear", "bags",
    "kidsClothing", "babyClothing"
  ];

  /**
   * Handle click on a category.
   * - Clears the search term if necessary.
   * - Navigates to the correct category route.
   * - Updates the selected category in context.
   */
  const handleCategoryClick = (categoryKey) => {
    if (searchTerm) {
      setSearchTerm("");
      handleSearch("");
    }
    if (categoryKey === "") {
      navigate("/home");
    } else {
      navigate(`/home/${categoryKey}`);
    }
    // Delay setting the category to avoid timing issues during navigation
    setTimeout(() => {
      setSelectedCategory(categoryKey);
    }, 100);
  };

  /**
   * Scroll the horizontal category navigation bar left or right.
   */
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 650;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  /**
   * Check if the user is logged in by verifying if a token exists in localStorage.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setIsLoggedIn(!!token);
  }, []);

  /**
   * Handle profile icon click:
   * - If logged in, navigate to the appropriate profile page.
   * - Otherwise, show the login popup.
   */
  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      navigate(role === "seller" ? "/profile_seller" : "/profile_user");
    } else {
      setShowLoginPopup(true);
    }
  };

  /**
   * Log out the user:
   * - Clear all data in localStorage.
   * - Update state and return to the home page.
   */
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  /**
   * Handle text direction (RTL/LTR) when changing languages.
   */
  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  /**
   * Switch between Arabic (RTL) and French (LTR).
   */
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  /**
   * Handle search submission:
   * - If not currently on /home, navigate to /home first.
   * - Then execute the search.
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!location.pathname.startsWith("/home")) {
      navigate("/home");
      // Wait a short time to ensure Home is rendered before triggering the search
      setTimeout(() => {
        handleSearch(searchTerm);
      }, 100);
    } else {
      handleSearch(searchTerm);
    }
  };

  return (
    <>
      <div className="header" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {/* === TOP NAVIGATION BAR === */}
        <nav className="navbar">
          {/* Logo redirects to home */}
          <h1 className="logo">
            <Link to="/home" onClick={() => handleCategoryClick("")}>
              {t("myshop")}
            </Link>
          </h1>

          {/* === Navigation Icons (Home, Cart, Profile, etc.) === */}
          <div className="links">
            <Link to="/home">
              <img src="/icons/home_icon.svg" style={{ width: "26px", height: "35px" }} />
            </Link>

            {/* Chat Icon – nur wenn eingeloggt */}
            {isLoggedIn && (
              <img
                src="/icons/chat_icon.svg"
                style={{ width: "26px", height: "35px", marginLeft: "10px" }}
                alt="Chat"
                className="nav-icon"
                onClick={() => navigate("/chat")}
              />
            )}
            {role !== "seller" && (
              <Link to="/cart_page">
                <img src="/icons/empty_cart_icon.svg" style={{ width: "26px", height: "35px" }} />
              </Link>
            )}

            {/* Show different icons depending on login status */}
            {isLoggedIn ? (
              <img
                src="/icons/profile_icon.svg"
                style={{ width: "24px", height: "50px" }}
                className="nav-icon"
                onClick={handleProfileClick}
              />
            ) : (
              <img
                src="/icons/login_icon.svg"
                style={{ width: "24px", height: "24px" }}
                alt="Login"
                className="nav-icon"
                onClick={handleProfileClick}
              />
            )}

            {/* Logout icon only visible when logged in */}
            {isLoggedIn && (
              <img
                src="/icons/logout_icon.svg"
                style={{ width: "24px", height: "24px" }}
                className="nav-icon"
                onClick={handleLogout}
              />
            )}

            {/* Language selector (French/Arabic) */}
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

        {/* === SEARCH BAR === */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder={t("search_product")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">{t("search")}</button>
        </form>

        {/* === HORIZONTAL CATEGORY NAVIGATION === */}
        <nav className="horizontal-nav">
          <button className="scroll-arrow left" onClick={() => scroll('left')}>‹</button>

          <ul className="nav-scroll-list" ref={scrollRef}>
            {/* "Home" category */}
            <li
              className={`nav-item ${selectedCategory === "" ? "active" : ""}`}
              onClick={() => handleCategoryClick("")}
            >
              {t("home")}
            </li>

            {/* Loop through all categories */}
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
      </div>

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

    </>
  );
}

export { Header };
