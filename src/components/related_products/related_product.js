import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./related_products.css";
import ProductCard from '../product_card/product_card';


function RelatedProducts({ category, currentProductId }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    if (i18n.language === "ar") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [i18n.language]);

  useEffect(() => {
    let url = `${apiUrl}/products/latest?page=1&limit=8`;
    if (category) {
      url += `&category=${category}`;
    }
  if (currentProductId) {
    url += `&not=${currentProductId}`; // 🚫 Aktuelles Produkt ausschließen
  }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) {
          // Filtere die aktuelle Product ID heraus
          const filteredProducts = data.products.filter(
            (product) => product._id !== currentProductId
          );
          setLatestProducts(filteredProducts);
        } else {
          setLatestProducts([]);
        }
      })
      .catch((err) => console.error("Error fetching latest products:", err));
  }, [category, currentProductId]);

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
