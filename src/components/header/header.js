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
import { BsFillCupHotFill } from "react-icons/bs";

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

  const categoryKeys = [
    "womens", "mens", "kids"
  ];

  const subCategories = {
    womens: ["all-women", "clothes", "shoes", "bags", "accessories", "beauty", "other-women"],
    mens: ["all-men", "clothes", "shoes", "accessories", "other-mens"],
    kids: ["all-kids", "girls-clothing", "boys-clothing", "baby-clothing", "other-kids"]
  };

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
    const firstSub = subCategories[categoryKey][0];
    navigate(`/home/${categoryKey}/${firstSub}`);
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
        setSelectedSubCategory(subCategories[selectedCategory][0]);
      }
    } else {
      setSelectedSubCategory("");
    }
  }, [selectedCategory, activePath]);

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      navigate(role === "seller" ? "/profile_seller" : "/profile_user");
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!activePath.startsWith("/home")) {
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

            {/* <Link to="/learn" onClick={(e) => handleClickOnPage(e, "/learn")}>
              {activePath === "/learn"
                ? <BsFillCupHotFill className='nav-icon-header' />
                : <BsFillCupHotFill className='nav-icon-header' />
              }
            </Link> */}

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {subCategories[selectedCategory].map((sub, index) => {

                return (

                  <li key={index}
                    className={`submenu-item-header ${selectedSubCategory === sub ? "active" : ""}`}
                    onClick={() => setSelectedSubCategory(sub)}

                  >
                    <Link to={`/home/${selectedCategory}/${sub}`}>
                      {t(sub)}
                    </Link>
                  </li>
                );
              }

              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export { Header };
