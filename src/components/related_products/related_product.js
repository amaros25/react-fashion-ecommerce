import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./related_products.css";
import ProductCard from '../product_card/product_card';
import LoadingSpinner from "../utils/loading_spinner";
import { useRelatedProductManager } from "../api_managers/useRelatedProductManager";

function RelatedProducts({ category, currentProductId }) {
  const { t } = useTranslation();

  // Nutze den spezialisierten Manager
  const { relatedProducts, isLoading, isError, hasData } = useRelatedProductManager(
    category,
    currentProductId
  );

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>{t("fetch_related_products_failed")}</div>;
  if (!hasData) return null;

  return (
    <div className="related-container">
      <hr className="product-divider" />
      <h2 className="related-title">{t("related_products.title")}</h2>
      <div className="related-grid">
        {relatedProducts.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;