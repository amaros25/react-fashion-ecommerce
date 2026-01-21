import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaTrash, FaArrowRight, FaShoppingBag, FaStore } from "react-icons/fa";
import { toast } from "react-toastify";
import { cities, citiesData } from '../utils/const/cities';
import { ORDER_STATUS } from "../utils/const/order_status";
import { useAuth } from "../../context/AuthContext";
import { useUserProfileManager } from "../api_managers/userProfileHookManager.js";
import { useCartManager } from "../api_managers/useCartManager.js";
import { useQueryClient } from '@tanstack/react-query';
import "./cart_page.css";
const CartPage = () => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const { userId, token } = useAuth();

  const { user, loading: userLoading } = useUserProfileManager(userId, token);
  const {
    cart,
    groupedCart,
    sellersMap,
    isLoadingSellers,
    isSubmitting,
    handleRemoveItem,
    submitGroups
  } = useCartManager(userId, token, queryClient);

  const navigate = useNavigate();
  const [isDelivery, setIsDelivery] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Submit Order
  const handleNewOrder = async () => {
    const result = await submitGroups(user, isDelivery, ORDER_STATUS.PENDING);
    if (result.success) {
      navigate("/profile_user");
    } else if (result.loginRequired) {
      navigate("/login");
    }
  };

  const calculateSellerTotal = (sellerItems) => {
    const subtotal = sellerItems.reduce(
      (sum, item) => sum + Number(item.price) * (item.quantity || 1),
      0
    );
    const shippingCost = isDelivery ? sellerItems.reduce((sum, item) => sum + (Number(item.delprice) || 0), 0) : 0;
    return subtotal + shippingCost;
  };

  const calculateTotal = () => {
    return Object.entries(groupedCart).reduce((total, [_, items]) => {
      const subtotal = items.reduce(
        (sum, item) => sum + Number(item.price) * (item.quantity || 1),
        0
      );
      const shippingCost = isDelivery ? items.reduce((sum, item) => sum + (Number(item.delprice) || 0), 0) : 0;
      return total + subtotal + shippingCost;
    }, 0);
  };

  const isButtonDisabled = isSubmitting || (isDelivery && !user?.address) || !cart.length;
  const dir = i18n.language === "ar" ? "rtl" : "ltr";

  if (cart.length === 0) {
    return (
      <div className="cart-page-empty" dir={dir}>
        <div className="empty-state">
          <FaShoppingBag className="empty-icon" />
          <h2>{t("cart_page.empty_cart")}</h2>
          <p>{t("cart_page.empty_desc") || "Looks like you haven't added anything to your cart yet."}</p>
          <button onClick={() => navigate("/home")} className="continue-shopping-btn">
            {t("cart_page.continue_shopping") || "Continue Shopping"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container" dir={dir}>
      <div className="cart-header">
        <h1>{t("cart_page.title")}</h1>
        <span className="item-count">{cart.length} {t("cart_page.items") || "Items"}</span>
      </div>
      {Object.entries(groupedCart).length > 0 ? (
        <div className="cart-layout">
          <div className="cart-items-section">

            {Object.entries(groupedCart).map(([sellerId, items]) => {
              const seller = sellersMap[sellerId];
              return (
                <div key={sellerId} className="seller-group">
                  {seller ? (
                    <div className="seller-header-modern">
                      <FaStore className="store-icon" />
                      <span className="cart-seller-name">{seller.shopName}</span>
                    </div>
                  ) : (
                    <div className="seller-header-modern">
                      <FaStore className="store-icon" />
                      <span className="cart-seller-name">{isLoadingSellers ? t("loading") : t("unknown_seller")}</span>
                    </div>
                  )}
                  <div className="items-list">
                    {items.map((item, i) => (
                      <div key={item.variantId || i} className="cart-item-modern">
                        <div className="item-image-wrapper" onClick={() => navigate(`/product/${item.productId}`)}>
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="item-details">
                          <div className="item-info-top">
                            <h3 onClick={() => navigate(`/product/${item.productId}`)}>{item.name}</h3>
                            <button
                              className="remove-btn-modern"
                              onClick={() => handleRemoveItem(sellerId, i)}
                              aria-label="Remove item"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <div className="item-specs">
                            <span className="spec-badge">{item.size}</span>
                            <span className="spec-badge" style={{ backgroundColor: item.color }}></span>
                          </div>
                          <div className="item-price-row">
                            <span className="quantity">Qty: {item.quantity}</span>
                            <span className="price">{(Number(item.price) * item.quantity).toFixed(3)} {t("price_suf")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="seller-subtotal">
                    <span>{t("cart_page.shipping")}: {items.reduce((sum, item) => sum + (Number(item.delprice) || 0), 0).toFixed(3)} {t("price_suf")}</span>
                    <span className="subtotal-val">
                      {t("cart_page.subtotal")}: {calculateSellerTotal(items).toFixed(3)} {t("price_suf")}
                    </span>
                  </div>
                </div>
              );
            })
            }

          </div>

          <div className="cart-summary-section">
            <div className="summary-card">
              <h2>{t("cart_page.order_summary")}</h2>

              {/* Delivery/Pickup Toggle */}
              <div className="delivery-toggle">
                <button
                  className={`toggle-btn ${isDelivery ? 'active' : ''}`}
                  onClick={() => setIsDelivery(true)}
                >
                  🚚 {t("cart_page.delivery") || "Delivery"}
                </button>
                <button
                  className={`toggle-btn ${!isDelivery ? 'active' : ''}`}
                  onClick={() => setIsDelivery(false)}
                >
                  🏪 {t("cart_page.pickup") || "Pickup"}
                </button>

              </div>

              {!isDelivery && (
                <div className="pickup-info">
                  {t("cart_page.pickup_info")}
                </div>
              )}
              {/* Delivery Address */}
              {isDelivery && user?.address && (
                <div className="delivery-address">
                  <p className="address-label">📍 {t("cart_page.delivery_address") || "Delivery Address"}:</p>
                  <p className="address-text">
                    {user.address}, {citiesData[cities[user.city]][user.subCity]}, {cities[user.city]}
                  </p>
                  {user.phone && (
                    <p className="address-text">
                      📞 {user.phone}
                    </p>
                  )}
                </div>
              )}

              {isDelivery && !user?.address && (
                <div className="address-warning">
                  ⚠️ {t("cart_page.add_address") || t("cart_page.missed_address_add_in_profile")}
                  <button className="update-address-btn" onClick={() => navigate("/profile_user")}>
                    {t("cart_page.update_address") || "Update Address"}
                  </button>
                </div>
              )}

              <div className="summary-row">
                <span>{t("cart_page.subtotal")}</span>
                <span>{cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(3)} {t("price_suf")}</span>
              </div>
              {isDelivery && (
                <div className="summary-row">
                  <span>{t("cart_page.shipping")}</span>
                  <span>{cart.reduce((sum, item) => sum + (Number(item.delprice) || 0), 0).toFixed(3)} {t("price_suf")}</span>
                </div>
              )}
              <div className="divider"></div>
              <div className="summary-row total">
                <span>{t("cart_page.total")}</span>
                <span>{calculateTotal().toFixed(3)} {t("price_suf")}</span>
              </div>

              <button
                className="checkout-btn"
                onClick={handleNewOrder}
                disabled={isButtonDisabled}
              >
                {isSubmitting ? "Processing..." : t("product_page.submit_order")}
                {!isSubmitting && <FaArrowRight />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p>{t("cart_page.no_items_in_cart")}</p>
      )}
    </div>
  );
};

export default CartPage;
