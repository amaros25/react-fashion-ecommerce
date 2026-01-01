import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./related_products.css";
import ProductCard from '../product_card/product_card';
import useRelatedProducts from "./hooks/useRelatedProducts";
import LoadingSpinner from "../utils/loading_spinner";

function RelatedProducts({ category, currentProductId }) {

  const { t, i18n } = useTranslation();
  const { latestProducts, loading } = useRelatedProducts(
    category,
    currentProductId
  );

  useEffect(() => {
    if (i18n.language === "ar") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [i18n.language]);
  if (loading) return <LoadingSpinner />;


  return (
    <div className="related-container">
      <hr className="product-divider" />
      <h2 className="related-title">{t("related_products.title")}</h2>
      <div className="related-grid">
        {latestProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
