import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import "./seller_products.css";
import { useNavigate } from "react-router-dom";

function SellerProducts({ sellerId, apiUrl, token }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const fetchProducts = async (page = 1) => {
    try {
      const res = await fetch(
        `${apiUrl}/products/seller/${sellerId}?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1);
    } catch (err) {
      console.error(t("error_loading_products"), err);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (sellerId) fetchProducts(currentPage);
  }, [sellerId, currentPage]);

  return (
    <div
      className="seller-products-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="product-filter-card">
        <input
          type="text"
          placeholder={t("search_product_by_id")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => fetchProducts(1)}>🔍</button>
      </div>

      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product._id}
              className="product-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="product-image-wrapper">
                <img
                  src={product.image?.[0]}
                  alt={product.name}
                  className="product-image"
                />
                <span className="product-number">
                  {product.productNumber || "–"}
                </span>
              </div>

              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="price">
                  {" "}
                  {product.price ? `${product.price} ${t("cart_page.price_suf")}` : t("price_not_available")}
                </p>
                <p className="order-count">
                  🛒{" "}
                  {product.orderCount > 0
                    ? `${product.orderCount}× ${t("times_ordered")}`
                    : t("no_orders_yet")}
                </p>
              </div>

              <span className="product-date">
                {new Date(product.createdAt).toLocaleDateString(i18n.language)}
              </span>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>{t("no_products_found")}</p>
        )}
      </div>

      <div className="pagination">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={i + 1 === currentPage ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SellerProducts;
