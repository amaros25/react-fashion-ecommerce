import React, { useRef, useEffect, useState, useContext } from 'react';
import './header.css';
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FilterContext } from '../filter_context/filter_context';
import { FaRegHeart } from "react-icons/fa";
import { RiShoppingCart2Line } from "react-icons/ri";
import { RiShoppingCart2Fill } from "react-icons/ri";
import { IoHomeOutline } from "react-icons/io5";
import { IoHomeSharp } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoChatboxEllipses } from "react-icons/io5";
import { categoryKeys, subCategories } from '../utils/const/category';

function Header() {

  const location = useLocation();
  const activePath = location.pathname;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const scrollRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const {
    handleSearch,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy
  } = useContext(FilterContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);



  const handleCategoryClick = (categoryKey) => {
    console.log("categoryKey: ", categoryKey);

    if (searchTerm) {
      setSearchTerm("");
      handleSearch("");
    }

    if (categoryKey === "") {
      navigate("/home");
      setSelectedCategory("");
      setSelectedSubCategory("");
      return;
    }
    setSelectedCategory(categoryKey);
    setSelectedSubCategory("all");
    navigate(`/home/${categoryKey}/all`);
  };

  const handleHomeClick = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
  };

  const handleClickOnPage = (e, path) => {
    if (activePath === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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
    console.log("token: ", token);
    console.log("storedRole: ", storedRole);
    setRole(storedRole);
    setIsLoggedIn(!!token);
  }, []);

  // Sync selectedSubCategory with URL and selectedCategory
  useEffect(() => {
    const pathParts = activePath.split('/');
    const subcategoryFromUrl = pathParts[3]; // /home/category/subcategory

    if (selectedCategory && subCategories[selectedCategory]) {
      if (subcategoryFromUrl && subCategories[selectedCategory].includes(subcategoryFromUrl)) {
        setSelectedSubCategory(subcategoryFromUrl);
      } else {
        // If no valid subcategory in URL, set to first one
        console.log("subcategoryFromUrl: ", subcategoryFromUrl);
        console.log("subCategories[selectedCategory][0]: ", subCategories[selectedCategory][0]);
        setSelectedSubCategory("all");
      }
    } else {
      setSelectedSubCategory("all");
    }
  }, [selectedCategory, activePath]);

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      if (role === "admin") {
        navigate("/profile_admin");
      } else {
        navigate(role === "seller" ? "/profile_seller" : "/profile_user");
      }
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const isRtl = i18n.language === 'ar';
    document.body.dir = isRtl ? 'rtl' : 'ltr';
    if (isRtl) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Local state for search input to decouple typing from fetching
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const lastSubmitTimeRef = useRef(0); // To track last submission time for throttling

  // Sync local state if global searchTerm changes externally (optional but good for consistency)
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const now = Date.now();
    // Spam protection: prevent requests if less than 1 second has passed
    if (now - lastSubmitTimeRef.current < 1000) {
      console.log("Search ignored to prevent spam (throttling).");
      return;
    }
    lastSubmitTimeRef.current = now;

    if (!activePath.startsWith("/home")) {
      navigate("/home");
      setTimeout(() => {
        handleSearch(localSearchTerm);
      }, 100);
    } else {
      handleSearch(localSearchTerm);
    }
  };

  return (
    <>
      <div className="header" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <nav className="navbar-header">
          <h1 className="logo-header">
            <Link to="/home" onClick={(e) => {
              handleClickOnPage(e, "/home");
              handleHomeClick(e);
            }}>
              {t("myshop")}
            </Link>
          </h1>
          <div className="links-header">
            <Link to="/home" onClick={(e) => {
              handleClickOnPage(e, "/home");
              handleHomeClick(e);
            }}>
              {activePath.startsWith("/home")
                ? <IoHomeSharp className='nav-icon-header' />
                : <IoHomeOutline className='nav-icon-header' />
              }
            </Link>
            {isLoggedIn && (
              <Link to="/chat" onClick={(e) => handleClickOnPage(e, "/chat")}>
                {activePath === "/chat"
                  ? <IoChatboxEllipses className='nav-icon-header' />
                  : <IoChatboxEllipsesOutline className='nav-icon-header' />
                }
              </Link>
            )}
            {role !== "seller" && (
              <Link to="/cart_page" onClick={(e) => handleClickOnPage(e, "/cart_page")}>
                {activePath === "/cart_page"
                  ? <RiShoppingCart2Fill className='nav-icon-header' />
                  : <RiShoppingCart2Line className='nav-icon-header' />
                }
              </Link>
            )}
            <Link to="/saved_products" onClick={(e) => handleClickOnPage(e, "/saved_products")}>
              {activePath === "/saved_products"
                ? <FaHeart className='nav-icon-header' />
                : <FaRegHeart className='nav-icon-header' />
              }
            </Link>
            {localStorage.getItem("userId") ? (
              activePath === "/profile_user"
                ? <FaUser className='nav-icon-user-header' onClick={handleProfileClick} />
                : <FaRegUser className='nav-icon-user-header' onClick={handleProfileClick} />
            ) : (

              activePath === "/login"
                ? <FaUser className='nav-icon-user-header' onClick={handleProfileClick} />
                : <FaRegUser className='nav-icon-user-header' onClick={handleProfileClick} />
            )}

            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="language-select-header"
            >
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </nav>

        {activePath.startsWith("/home") && (
          <form onSubmit={handleSearchSubmit} className="search-form-header">
            <input
              type="text"
              placeholder={t("search_product")}
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            <button type="submit">{t("search")}</button>
          </form>
        )}


        <nav className="horizontal-nav-header">
          <button className="scroll-arrow-header left" onClick={() => scroll('left')}>‹</button>
          <ul className="nav-header-scroll-list-header" ref={scrollRef}>
            <li
              className={`nav-header-item-header ${selectedCategory === "" ? "active" : ""}`}
              onClick={(e) => {
                handleClickOnPage(e, "/home");
                handleCategoryClick("");
                handleHomeClick(e);
              }}
            >
              {t("home")}
            </li>
            {categoryKeys.map((key, index) => (
              <li
                key={index}
                className={`nav-header-item-header ${selectedCategory === key ? "active" : ""}`}
                onClick={() => handleCategoryClick(key)}
              >
                {t(`main-categories.${key}`)}
              </li>
            ))}
          </ul>
          <button className="scroll-arrow-header right" onClick={() => scroll('right')}>›</button>
        </nav>

        {activePath.startsWith("/home") && (
          <div className="sort-container-header">
            <label htmlFor="sort-select" className="sort-label-header">{t("sort_by")}:</label>
            <select
              id="sort-select"
              className="sort-select-header"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">{t("sort.newest")}</option>
              <option value="price_asc">{t("sort.price_low")}</option>
              <option value="price_desc">{t("sort.price_high")}</option>
              <option value="rating">{t("sort.rating")}</option>
            </select>
          </div>
        )}
        {/* Submenu Section */}

        {selectedCategory && activePath.startsWith("/home") && (

          <div className="submenu-container-header">
            <ul className="submenu-list-header">
              <li
                className={`submenu-item-header ${selectedSubCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedSubCategory("all")}
              >
                <Link to={`/home/${selectedCategory}/all`}>
                  {t(`all-${selectedCategory}`)}
                </Link>
              </li>
              {subCategories[selectedCategory].map((sub, index) => {
                return (
                  <li key={index}
                    className={`submenu-item-header ${selectedSubCategory === sub ? "active" : ""}`}
                    onClick={() => setSelectedSubCategory(sub)}>
                    <Link to={`/home/${selectedCategory}/${sub}`}>
                      {t(sub)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export { Header };
