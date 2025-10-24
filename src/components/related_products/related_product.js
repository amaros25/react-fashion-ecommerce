import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./related_products.css";

function RelatedProducts({ category }) {
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

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) {
          setLatestProducts(data.products);
        } else {
          setLatestProducts([]);
        }
      })
      .catch((err) => console.error("Error fetching latest products:", err));
  }, [category]);

  return (
    <div className="related-container">
      <h2 className="related-title">{t("related_products.title")}</h2>
      <div className="related-grid">
        {latestProducts.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="related-card"
          >
            <img
              src={product.image[0]}
              alt={product.name}
              className="related-image"
              loading="lazy"
            />
            <div className="related-info">
              <h3>{product.name}</h3>
              <p className="price">{product.price} DT</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
