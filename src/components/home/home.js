import React, { useRef, useEffect, useState } from 'react'; // React hooks
import './home.css'; // Main styles for Home component
import '../products/product_list.css'; // Styles for product list display
import '../products/new_product_list.css'; // Styles for new product list display

import TopBannerSlider from '../top_banner_slider/top_banner_slider'; // Component for top image/banner slider
import { Header } from '../header/header'; // Header component, including search and category selection
import Foot from '../foot/foot'; // Footer component
import { Link } from "react-router-dom"; // For routing to product detail pages
import { useTranslation } from "react-i18next"; // i18n hook for translations and RTL support
import Pagination from './pagination.js'; // Pagination component for product lists

function Home() {
  const apiUrl = process.env.REACT_APP_API_URL; // Base URL for backend API

  // State for currently selected category filter; empty means no filter
  const [selectedCategory, setSelectedCategory] = useState("");

  // State for current search term from search input
  const [searchTerm, setSearchTerm] = useState("");

  // i18n hooks for translation and language direction
  const { t, i18n } = useTranslation();

  /**
   * Handle search input from Header component
   * @param {string} searchInput - The term user typed in search
   */
  const handleSearch = (searchInput) => {
    console.log("🟢 searchInput: ", searchInput);
    setSearchTerm(searchInput);  // Set the search term
    setSelectedCategory("");     // Reset selected category when searching
    setPage(1);                 // Reset to first page of results
  };

  // State for array of latest products fetched from backend
  const [latestProducts, setLatestProducts] = useState([]);

  // Current page for pagination (starts from 1)
  const [page, setPage] = useState(1);

  // Total number of pages available from backend (used for Pagination component)
  const [totalPages, setTotalPages] = useState(1);

  // Total number of products available (useful for displaying counts or stats)
  const [productsCounter, setTotalProductsCounter] = useState(1);

  // Filter latestProducts by selected category if one is chosen
  // Defensive check ensures latestProducts is always an array
  const filteredProducts = selectedCategory
    ? (Array.isArray(latestProducts) ? latestProducts.filter(p => p.category === selectedCategory) : [])
    : (Array.isArray(latestProducts) ? latestProducts : []);

  /**
   * Fetch latest products whenever page, selectedCategory, or searchTerm changes.
   * Adds query parameters to API URL accordingly.
   */
  useEffect(() => {
    let url = `${apiUrl}/products/latest?page=${page}&limit=15`; // Base endpoint with pagination

    if (selectedCategory) {
      url += `&category=${selectedCategory}`; // Append category filter if selected
    }

    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`; // Append search term, URL encoded
    }

    console.log("🟢 url: ", url);

    // Fetch products data from backend
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.products)) {
          setLatestProducts(data.products);  // Update products list state
          setTotalPages(data.totalPages);    // Update total pages for pagination
          setTotalProductsCounter(data.totalAllProducts); // Update total product count
        } else {
          // If API response format is unexpected, reset states
          setLatestProducts([]);
          setTotalPages(1);
        }
      })
      .catch(err => console.error('Error fetching latest products:', err));
  }, [page, selectedCategory, searchTerm]); // Dependency array triggers re-fetch on these changes

  /**
   * Effect to toggle RTL (right-to-left) styling based on current language.
   * Adds or removes 'rtl' class on <body> element.
   */
  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  // Render component UI
  return (
    // Root container with dynamic text direction based on language
    <div className="main-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      
      {/* Header component with category selector and search input */}
      <Header 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
        onSearch={handleSearch}
      />
      
      {/* Show top banner slider only if no search term and no category selected */}
      {searchTerm === "" && selectedCategory === "" && <TopBannerSlider />}

      {/* Latest products grid/list */}
      <div className="latest-product-list">
        {filteredProducts.map((product) => (
          <Link 
            key={product._id} 
            to={`/product/${product._id}`} 
            className="latest-product-item"
          >
            {/* Product image */}
            <img 
              src={product.image[0]} 
              alt={product.name} 
              className="latest-product-image" 
            />
            {/* Product name */}
            <h3>{product.name}</h3>
            {/* Product price with currency */}
            <p>{product.price} DT</p>
            <p className="product-sizes">
              {t("sizes")}: {product.sizes.map(sizeObj => sizeObj.size).join(", ")}
            </p>
          </Link>
        ))}
      </div>

      {/* Pagination component with current page and total pages */}
      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />

      {/* Footer component */}
      <Foot/>
    </div>
  );
}

export default Home;
