import React, { useRef, useEffect, useState, useContext } from 'react';
import './header.css';
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FilterContext } from '../filter_context/filter_context';
import SavedProducts from '../saved_products/saved_products';
import { FaRegHeart } from "react-icons/fa";

function Header() {

  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const scrollRef = useRef(null);

  const {
    selectedCategory,
    setSelectedCategory,
    handleSearch,
    searchTerm,
    setSearchTerm
  } = useContext(FilterContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

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
    if (categoryKey === "") {
      navigate("/home");
    } else {
      navigate(`/home/${categoryKey}`);
    }
    setTimeout(() => {
      setSelectedCategory(categoryKey);
    }, 100);
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
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!location.pathname.startsWith("/home")) {
      navigate("/home");
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
        <nav className="navbar">
          <h1 className="logo">
            <Link to="/home" onClick={() => handleCategoryClick("")}>
              {t("myshop")}
            </Link>
          </h1>

          <div className="links">
            <Link to="/home">
              <img src="/icons/home_icon.svg" style={{ width: "26px", height: "35px" }} />
            </Link>

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
            <Link to="/saved_products">
              <FaRegHeart style={{ width: "26px", height: "35px", marginLeft: "10px" }} />
            </Link>
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

            {isLoggedIn && (
              <img
                src="/icons/logout_icon.svg"
                style={{ width: "24px", height: "24px" }}
                className="nav-icon"
                onClick={handleLogout}
              />
            )}

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
      </div>
    </>
  );
}

export { Header };
