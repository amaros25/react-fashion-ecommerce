import React, {useEffect, useState, useContext } from 'react';
import { useTranslation } from "react-i18next";
import './home.css';
import '../products/new_product_list.css';
import TopBannerSlider from '../top_banner_slider/top_banner_slider';
import { Header } from '../header/header';
import Foot from '../foot/foot';
import { Link } from "react-router-dom";
import Pagination from './pagination.js';
import { FilterContext } from '../filter_context/filter_context';

function Home() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const {
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm
  } = useContext(FilterContext);

  const { t, i18n } = useTranslation();

  const [latestProducts, setLatestProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsCounter, setTotalProductsCounter] = useState(1);

  const filteredProducts = selectedCategory
    ? latestProducts.filter(p => p.category === selectedCategory)
    : latestProducts;

  useEffect(() => {
    let url = `${apiUrl}/products/latest?page=${page}&l`;

    if (selectedCategory) {
      url += `&category=${selectedCategory}`;
    }

    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.products)) {
          setLatestProducts(data.products);
          setTotalPages(data.totalPages);
          setTotalProductsCounter(data.totalAllProducts);
        } else {
          setLatestProducts([]);
          setTotalPages(1);
        }
      })
      .catch(err => console.error('Error fetching latest products:', err));
  }, [page, selectedCategory, searchTerm]);

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return (
    <div className="main-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <Header />
  
      {searchTerm === "" && selectedCategory === "" && <TopBannerSlider />}

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
              loading="lazy" 
            />
            <h3>{product.name}</h3>
            <p>{product.price} DT</p>
            <p className="product-sizes">
              {t("sizes")}: {product.sizes.map(sizeObj => sizeObj.size).join(", ")}
            </p>
          </Link>
        ))}
      </div>

      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />

      <Foot/>
   
    </div>

  );
}

export default Home;
