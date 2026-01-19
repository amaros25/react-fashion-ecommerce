import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from "react-i18next";
import Pagination from './pagination.js';
import { FilterContext } from '../filter_context/filter_context';
import ProductCard from '../product_card/product_card';
import { useParams } from 'react-router-dom';
import { useHomeProductManager } from '../api_managers/useHomeProductManager';
import './home.css';
import '../products/new_product_list.css';
import { categoryKeys, subCategories } from '../utils/const/category';
import LoadingSpinner from '../loading/loading_spinner';
import { debounce } from 'lodash';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { category, subcategory } = useParams();
  const { searchTerm, sortBy } = useContext(FilterContext);
  const urlCategory = categoryKeys.includes(category) ? categoryKeys.indexOf(category) : null;
  const urlSubcategory = category && subcategory && subcategory !== "all" && subCategories[category]
    ? subCategories[category].indexOf(subcategory)
    : null;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  // Remove local loading/error states that are now managed or derived
  // kept for layout control if needed, but manager provides them.

  const { latestProducts, totalPages, readingDataDone, fetchError } = useHomeProductManager(
    page,
    limit,
    urlCategory,
    urlSubcategory,
    searchTerm,
    sortBy
  );

  useEffect(() => {
    const handleResize = debounce(() => {
      const width = window.innerWidth;
      if (width <= 786) {
        setLimit(16);
      } else {
        setLimit(24);
      }
    }, 200);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simplified Error/Loading Logic relying on Manager
  // The complex timeout logic in previous Home.js was likely to handle slow legacy fetch
  // We can trust readingDataDone from the new hook for now.
  const isLoading = !readingDataDone;

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  const scrollup = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      scrollup();
    }
  };

  return (
    <div className="main-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {isLoading && !fetchError && <LoadingSpinner />}
      {fetchError && <div className="error-message">{fetchError}</div>}

      <div className="latest-product-list">
        {latestProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {latestProducts.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Home;
