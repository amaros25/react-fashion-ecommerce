import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./seller_products.css";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../utils/loading_spinner";
import { FaSearch, FaBoxOpen } from "react-icons/fa";

function SellerProducts({ sellerId, apiUrl, token }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12); // Increased limit for better grid view

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) fetchProducts(currentPage);
  }, [sellerId, currentPage]);

  const getStateLabel = (state) => {
    switch (state) {
      case 0: return t("product_state.pending");
      case 1: return t("product_state.active");
      case 2: return t("product_state.blocked");
      case 3: return t("product_state.deleted");
      default: return t("product_state.unknown");
    }
  };

  const getStateClass = (state) => {
    switch (state) {
      case 0: return "state-pending";
      case 1: return "state-active";
      case 2: return "state-blocked";
      case 3: return "state-deleted";
      default: return "state-unknown";
    }
  };

  return (
    <div
      className="seller-products-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="products-header-actions">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t("search_product_by_id")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts(1)}
          />
        </div>
      </div>

      <div className="product-list-grid">
        {!loading && products.length === 0 ? (
          <div className="no-products-state">
            <FaBoxOpen className="no-products-icon" />
            <p>{t("no_products_found")}</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="premium-product-card"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="card-image-container">
                <img
                  src={product.image?.[0]}
                  alt={product.name}
                  className="card-image"
                />
                <div className="card-overlay">
                  <span className="view-details-btn">{t("view_details")}</span>
                </div>
                {product.productNumber && (
                  <span className="product-badge">{product.productNumber}</span>
                )}
              </div>

              <div className="card-content">
                <h4 className="card-title">{product.name}</h4>
                <div className="card-meta">
                  <span className="card-price">
                    {product.price ? `${product.price} ${t("price_suf")}` : t("price_not_available")}
                  </span>
                  <span className="card-orders">
                    {product.orderCount > 0 ? `${product.orderCount} ${t("orders")}` : t("no_orders")}
                  </span>
                </div>
                <div className="card-footer">
                  <span className="date-added">
                    {t("added_date")}: {new Date(product.createdAt).toLocaleDateString(i18n.language)}
                  </span>
                  <span className={`current-state-badge ${getStateClass(product.states?.[product.states.length - 1]?.state)}`}>
                    {getStateLabel(product.states?.[product.states.length - 1]?.state)}
                  </span>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`page-btn ${i + 1 === currentPage ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {loading && <LoadingSpinner />}
    </div>
  );
}

export default SellerProducts;
