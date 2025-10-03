import React, { useRef, useEffect, useState } from 'react'; // React Hooks
import './home.css'; // Main styling
import '../products/product_list.css'; // Styling for product list
import '../products/new_product_list.css'; // Styling for new product list

import TopBannerSlider from '../top_banner_slider/top_banner_slider'; // Component for top image slider
import TopSection from '../top_section/top_section'; // Component for sections (e.g., offers, bestsellers)

import Header from '../header/header'; // Header component
import { Link } from "react-router-dom"; // For routing to product detail pages
import { useTranslation } from "react-i18next"; // For internationalization (i18n)
import Pagination from './pagination.js'; // Pagination component

function Home() {
  // i18n translation functions
  const { t, i18n } = useTranslation();

  // Reference for the horizontal scroll container (category list)
  const scrollRef = useRef(null);

  // List of category keys (used for filtering and translation)
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

  // State for homepage sections like offers and best orders
  const [sections, setSections] = useState([]);

  // Extract offers and bestOrders from fetched sections
  const offers = sections?.offers || [];
  const bestOrders = sections?.bestOrders || [];

  // States for latest products, selected category, pagination
  const [latestProducts, setLatestProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Currently selected category
  const [page, setPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(1); // Total number of pages for pagination
  const [productsCounter, setTotalProductsCounter] = useState(1); // Total number of pages for pagination

  // Filter products by selected category (if any)
  const filteredProducts = selectedCategory
    ? (Array.isArray(latestProducts) ? latestProducts.filter(p => p.category === selectedCategory) : [])
    : (Array.isArray(latestProducts) ? latestProducts : []);

  // Load latest products whenever `page` or `selectedCategory` changes
  useEffect(() => {
    let url = `/api/products/latest?page=${page}&limit=12`; // Backend endpoint for latest products
    if (selectedCategory) {
      url += `&category=${selectedCategory}`; // Add category as a query param if selected
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.products)) {
          setLatestProducts(data.products); // Save products to state
          setTotalPages(data.totalPages); // Update total page count
          setTotalProductsCounter(data.totalAllProducts); // Update total page count
        } else {
          // Fallback if response is invalid
          setLatestProducts([]);
          setTotalPages(1);
        }
      })
      .catch(err => console.error('Error fetching latest products:', err));
  }, [page, selectedCategory]); // Re-run on page or category change

  // Scroll function for horizontal category list
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 650;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth' // Smooth scrolling animation
      });
    }
  };

  // Load homepage sections (offers, best orders) once on component mount
  useEffect(() => {
    fetch('/api/sections/')
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(err => console.error('Error fetching sections:', err));
  }, []);

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  // Component UI
  return (
    <div className="main-container">
      {/* Top header and image slider */}
      <Header />
      <TopBannerSlider />

      {/* Top sections (e.g., Best Offers & Best Orders) */}
      <div className="section-grid">
        <TopSection title={t("categoryBanner.bestOffers")} products={offers} /> 
        <TopSection title={t("categoryBanner.bestOrders")} products={bestOrders} />
      </div>

      {/* Horizontal category navigation */}
      <nav className="horizontal-nav">
        {/* Scroll left button */}
        <button className="scroll-arrow left" onClick={() => scroll('left')}>‹</button>

        {/* Category list */}
        <ul className="nav-scroll-list" ref={scrollRef}>
          {/* 'Home' item to reset category filter */}
          <li 
            className="nav-item"
            onClick={() => setSelectedCategory("")}>
            {t("home")}
          </li>

          {/* Render all categories */}
          {categoryKeys.map((key, index) => (
            <li
              key={index}
              className="nav-item"
              onClick={() => setSelectedCategory(key)}
            >
              {t(`categories.${key}`)} {/* Translated category name */}
            </li>
          ))}
        </ul>

        {/* Scroll right button */}
        <button className="scroll-arrow right" onClick={() => scroll('right')}>›</button>
      </nav>
      
      {/* Dynamic section title depending on selected category */}
      <h2 className="section-title" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        {selectedCategory ? t(`categories.${selectedCategory}`) : `${t("newProducts")} : ${productsCounter}`}
      </h2>

      {/* Latest product list */}
      <div className="latest-product-list">
        {filteredProducts.map((product) => (
          <Link 
            key={product._id} 
            to={`/product/${product._id}`} 
            className="latest-product-item"
          >
            <img 
              src={product.image[0]} 
              alt={product.name} 
              className="latest-product-image" 
            />
            <h3>{product.name}</h3>
            <p>{product.price} €</p>
          </Link>
        ))}
      </div>

      {/* Pagination component */}
      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />
    </div>
  );
}

export default Home;
