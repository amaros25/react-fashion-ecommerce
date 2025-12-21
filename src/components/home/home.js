import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from "react-i18next";
import './home.css';
import '../products/new_product_list.css';
import Pagination from './pagination.js';
import { FilterContext } from '../filter_context/filter_context';
import ProductCard from '../product_card/product_card';
import { useParams } from 'react-router-dom';
import { useHomeProducts } from './hooks/useHomeProducts';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { category, subcategory } = useParams();
  const { searchTerm, setSearchTerm, sortBy } = useContext(FilterContext);

  const categoryKeys = [
    "womens", "mens", "kids"
  ];
  const subCategories = {
    womens: ["all-women", "clothes", "shoes", "bags", "accessories", "beauty", "other-women"],
    mens: ["all-men", "clothes", "shoes", "accessories", "other-mens"],
    kids: ["all-kids", "girls-clothing", "boy-c lothing", "baby-clothing", "other-kids"]
  };

  const urlCategory =
    categoryKeys.includes(category) ? categoryKeys.indexOf(category) : null;

  const urlSubcategory =
    category && subcategory && subCategories[category]
      ? subCategories[category].indexOf(subcategory)
      : null;

  console.log("=> urlCategory:", urlCategory, "=> urlSubcategory:", urlSubcategory);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 786) {
        setLimit(16);
      } if (width >= 1280) {
        setLimit(24);
      } else {
        setLimit(24);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { latestProducts, totalPages } = useHomeProducts(
    page,
    limit,
    urlCategory,
    urlSubcategory,
    searchTerm,
    sortBy
  );

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    scrollup();
  };

  const scrollup = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="main-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {/* {searchTerm === "" && selectedCategory === "" && <TopBannerSlider />} */}
      <div className="latest-product-list">
        {latestProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
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
}

export default Home;
