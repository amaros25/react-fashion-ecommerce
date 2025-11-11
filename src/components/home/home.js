import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from "react-i18next";
import './home.css';
import '../products/new_product_list.css';
import { Header } from '../header/header';
import Foot from '../foot/foot';
import Pagination from './pagination.js';
import { FilterContext } from '../filter_context/filter_context';
import ProductCard from '../product_card/product_card';
import { useParams } from 'react-router-dom'; 

function Home() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { category } = useParams(); 

  // Context für die Kategorie und den Suchbegriff
  const { selectedCategory, setSelectedCategory, searchTerm, setSearchTerm } = useContext(FilterContext);
  const { t, i18n } = useTranslation();

  const [latestProducts, setLatestProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Abhängig von der selectedCategory filtern wir die Produkte
  const filteredProducts = selectedCategory
    ? latestProducts.filter(p => p.category === selectedCategory)
    : latestProducts;

  // useEffect zum Setzen der Kategorie basierend auf der URL
  useEffect(() => {
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [category, selectedCategory, setSelectedCategory]);

  // Produkte von der API laden
  useEffect(() => {
    let url = `${apiUrl}/products/latest?page=${page}`;

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
        } else {
          setLatestProducts([]);
          setTotalPages(1);
        }
      })
      .catch(err => console.error('Error fetching latest products:', err));
  }, [page, selectedCategory, searchTerm, apiUrl]);

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
      {/* {searchTerm === "" && selectedCategory === "" && <TopBannerSlider />} */}
      <div className="latest-product-list">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      <Pagination 
        page={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />
      <Foot />
    </div>
  );
}

export default Home;
