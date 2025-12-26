import { useEffect, useState, useContext } from 'react';
import { useTranslation } from "react-i18next";
import Pagination from './pagination.js';
import { FilterContext } from '../filter_context/filter_context';
import ProductCard from '../product_card/product_card';
import { useParams } from 'react-router-dom';
import { useHomeProducts } from './hooks/useHomeProducts';
import './home.css';
import '../products/new_product_list.css';
import { categoryKeys, subCategories } from '../utils/const/category';
import LoadingSpinner from '../loading/loading_spinner';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { category, subcategory } = useParams();
  const { searchTerm, sortBy } = useContext(FilterContext);
  const urlCategory = categoryKeys.includes(category) ? categoryKeys.indexOf(category) : null;
  const urlSubcategory = category && subcategory && subCategories[category]
    ? subCategories[category].indexOf(subcategory)
    : null;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  console.log("*** Home ***");
  console.log("=> category:", category, "=> subcategory:", subcategory);
  console.log("=> searchTerm:", searchTerm, "=> sortBy:", sortBy);
  console.log("=> urlCategory:", urlCategory, "=> urlSubcategory:", urlSubcategory);

  const { latestProducts, totalPages, readingDataDone, readingError } = useHomeProducts(
    page,
    limit,
    urlCategory,
    urlSubcategory,
    searchTerm,
    sortBy
  );
  console.log("=> latestProducts:", latestProducts);
  console.log("=> totalPages:", totalPages);
  console.log("=> readingDataDone:", readingDataDone);
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      console.log("handleResize => width:", width);
      if (width <= 786) {
        setLimit(16);
      } else {
        setLimit(24);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timer;
    if (readingError) {
      setLoading(false);
      setFetchError(t("home_error.error_while_reading_data"));
      return;
    }
    if (!readingDataDone) {
      setLoading(true);
      setFetchError(null);
      timer = setTimeout(() => {
        if (latestProducts.length === 0 && readingDataDone) {
          setLoading(false);
          setFetchError(t("home_error.noProducts"));
          return
        } else if (latestProducts.length === 0 && !readingDataDone) {
          setLoading(false);
          setFetchError(t("home_error.fetchTimeout"));
          return
        }
      }, 10000);
    } else {
      if (latestProducts.length === 0) {
        setFetchError(t("home_error.noProducts"));
      } else {
        setFetchError(null);
      }
      setLoading(false);
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [latestProducts, readingDataDone]);

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
    setPage(newPage);
    scrollup();
  };

  return (
    <div className="main-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      {loading && !fetchError && <LoadingSpinner />}
      {fetchError && <div className="error-message">{fetchError}</div>}

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
