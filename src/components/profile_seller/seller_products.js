import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBoxOpen } from "react-icons/fa";
import LoadingSpinner from "../utils/loading_spinner";
import "./seller_products.css";
import { useSellerProductFetchManager } from "../api_managers/useSellerProductFetchManager.js";

function SellerProducts({ sellerId, token }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // 1. Destructure using 'currentPage' as defined in your manager
  const {
    products,
    isLoading,
    handleSearch,
    handlePageChange,
    totalPages,
    currentPage
  } = useSellerProductFetchManager(sellerId, token);

  const [localSearch, setLocalSearch] = useState('');

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(localSearch);
    }
  };

  const calculateTotalStock = (product) => {
    if (!product || !Array.isArray(product.variants)) return 0;
    return product.variants.reduce((total, v) => total + (v.stock || 0), 0);
  };

  const getStateInfo = (product) => {
    const stateValue = product.currentState ?? 0;
    switch (stateValue) {
      case 0: return { label: t("product_state.pending"), class: "state-pending" };
      case 1: return { label: t("product_state.active"), class: "state-active" };
      case 2: return { label: t("product_state.blocked"), class: "state-blocked" };
      case 3: return { label: t("product_state.deleted"), class: "state-deleted" };
      default: return { label: t("product_state.unknown"), class: "state-unknown" };
    }
  };

  return (
    <div className="seller-products-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="products-header-actions">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t("search_product_by_id")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>

      <div className="product-list-grid">
        {!isLoading && products.length === 0 ? (
          <div className="no-products-state">
            <FaBoxOpen className="no-products-icon" />
            <p>{t("no_products_found")}</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="premium-product-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="card-image-container">
                <img
                  src={product.images?.[0]}
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
                <span className="card-stock">{t("stock")}: {calculateTotalStock(product)}</span>
                <div className="card-footer">
                  <span className="date-added">
                    {t("added_date")}: {new Date(product.createdAt).toLocaleDateString(i18n.language)}
                  </span>
                  <span className={`current-state-badge ${getStateInfo(product).class}`}>
                    {getStateInfo(product).label}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                // 2. FIXED: Changed 'page' to 'currentPage'
                className={`page-btn ${pageNum === currentPage ? "active" : ""}`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}

      {isLoading && <LoadingSpinner />}
    </div>
  );
}

export default SellerProducts;