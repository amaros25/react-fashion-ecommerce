import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaTrash, FaShoppingBag, FaStore, FaWallet, FaCreditCard, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
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
  const navigate = useNavigate();

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

  const [isDelivery, setIsDelivery] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNewOrder = async () => {
    if (!user?.phone || !user?.address) {
      toast.error(t("cart_page.please_update_profile_first"));
      return;
    }
    if (!paymentMethod) {
      toast.error(t("cart_page.please_select_payment"));
      return;
    }
    const result = await submitGroups(user, isDelivery, ORDER_STATUS.PENDING, paymentMethod);
    if (result.success && !result.redirecting) navigate("/profile_user");
    else if (result.loginRequired) navigate("/login");
  };

  const calculateSellerTotal = (items) => {
    const sub = items.reduce((s, i) => s + Number(i.price) * (i.quantity || 1), 0);
    const ship = isDelivery ? items.reduce((s, i) => s + (Number(i.delprice) || 0), 0) : 0;
    return sub + ship;
  };

  const calculateTotal = () => {
    return Object.entries(groupedCart).reduce((acc, [_, items]) => acc + calculateSellerTotal(items), 0);
  };

  const isProfileComplete = user?.phone && user?.address;
  const isButtonDisabled = isSubmitting || !isProfileComplete || !paymentMethod || !cart.length;
  const dir = i18n.language === "ar" ? "rtl" : "ltr";

  if (cart.length === 0) {
    return (
      <div className="cart-page-empty" dir={dir}>
        <div className="empty-state">
          <FaShoppingBag className="empty-icon" />
          <h2>{t("cart_page.empty_cart")}</h2>
          <button onClick={() => navigate("/home")} className="continue-shopping-btn">
            {t("cart_page.continue_shopping")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container" dir={dir}>
      <header className="cart-header">
        <h1>{t("cart_page.title")}</h1>
        <span className="item-count">{cart.length} {t("cart_page.items")}</span>
      </header>

      <div className="cart-layout">
        {/* LINKS: PRODUKTE NACH VERKÄUFER */}
        <div className="cart-items-section">
          {Object.entries(groupedCart).map(([sellerId, items]) => {
            const seller = sellersMap[sellerId];
            return (
              <section key={sellerId} className="seller-group">
                <div className="seller-header-modern">
                  <FaStore className="store-icon" />
                  <span className="cart-seller-name">
                    {seller ? seller.shopName : (isLoadingSellers ? "..." : t("unknown_seller"))}
                  </span>
                </div>
                <div className="items-list">
                  {items.map((item, i) => (
                    <div key={item.variantId || i} className="cart-item-modern">
                      {/* Links: Das Bild */}
                      <div className="item-image-wrapper" onClick={() => navigate(`/product/${item.productId}`)}>
                        <img src={item.image} alt={item.name} />
                      </div>

                      {/* Rechts: Die Details */}
                      <div className="item-details">
                        <div className="item-info-top">
                          <h3 className="item-title-large" onClick={() => navigate(`/product/${item.productId}`)}>
                            {item.name}
                          </h3>
                          <button className="remove-btn-modern" onClick={() => handleRemoveItem(sellerId, i)}>
                            <FaTrash />
                          </button>
                        </div>

                        {/* Farbe & Größe - Jetzt deutlich präsenter */}
                        <div className="item-specs-enhanced">
                          <div className="spec-item">
                            <span className="spec-label">{t("size")}:</span>
                            <span className="spec-value-badge">{item.size}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">{t("color")}:</span>
                            <span className="spec-color-circle" style={{ backgroundColor: item.color }}></span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">{t("quantity")}:</span>
                            <span className="spec-value">x{item.quantity}</span>
                          </div>
                        </div>

                        {/* Preis-Bereich: Untereinander gelistet */}
                        <div className="item-pricing-breakdown">
                          <div className="price-row-item">
                            <span className="price-label">{t("product_price")}:</span>
                            <span className="price-value">
                              {(Number(item.price) * item.quantity).toFixed(3)} <small>{t("price_suf")}</small>
                            </span>
                          </div>

                          {isDelivery && (
                            <div className="price-row-item shipping">
                              <span className="price-label">{t("cart_page.shipping")}:</span>
                              <span className="price-value">
                                {Number(item.delprice).toFixed(3)} <small>{t("price_suf")}</small>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Seller-Footer nur anzeigen, wenn es mehrere Verkäufer gibt */}
                {Object.keys(groupedCart).length > 1 && (
                  <div className="seller-footer-mini">
                    <span>
                      {t("cart_page.subtotal")}: {calculateSellerTotal(items).toFixed(3)}
                    </span>
                  </div>
                )}

              </section>
            );
          })}
        </div>

        {/* RECHTS: SUMMARY & CHECKOUT */}
        <aside className="cart-summary-section">
          <div className="summary-card">

            <h2 className="summary-title">{t("cart_page.order_summary")}</h2>

            <div className="delivery-toggle-modern">
              <button className={`toggle-tab ${isDelivery ? 'active' : ''}`} onClick={() => setIsDelivery(true)}>
                {t("cart_page.delivery")}
              </button>
              <button className={`toggle-tab ${!isDelivery ? 'active' : ''}`} onClick={() => setIsDelivery(false)}>
                {t("cart_page.pickup")}
              </button>
            </div>

            {/* INFO BLOCK: ADDRESS */}
            <div className="info-block">
              <span className="info-label">{isDelivery && t("cart_page.delivery_address")}</span>
              {isDelivery ? (
                isProfileComplete ? (
                  <div className="address-status">
                    <p><FaMapMarkerAlt /> {user.address}, {citiesData[cities[user.city]]?.[user.subCity]}</p>
                    <p><FaPhoneAlt /> {user.phone}</p>
                  </div>
                ) : (
                  <div className="address-status error">
                    <p>{t("cart_page.add_address")}</p>
                    <button className="btn-secondary small" onClick={() => navigate("/profile_user")}>
                      {t("cart_page.update_address")}
                    </button>
                  </div>
                )
              ) : (
                <p className="pickup-info-text">{t("cart_page.pickup_info")}</p>
              )}
            </div>

            {/* PAYMENT */}
            {/* PAYMENT */}
            <div className="payment-selection-modern">
              <span className="info-label">{t("cart_page.payment_method")}</span>
              <div className="payment-stack">
                {isDelivery ? (
                  <>
                    {/* Cash on Delivery */}
                    <div
                      className={`pay-option-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className="pay-option-content">
                        <FaWallet className="pay-icon active-icon-style" />
                        <span className="pay-text">{t("cart_page.cash_on_delivery")}</span>
                      </div>
                      {paymentMethod === 'cod' && <div className="select-dot"></div>}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Cash on Pickup */}
                    <div
                      className={`pay-option-card ${paymentMethod === 'pickup' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('pickup')}
                    >
                      <div className="pay-option-content">
                        <FaStore className="pay-icon active-icon-style" />
                        <span className="pay-text">{t("cart_page.cash_on_pickup")}</span>
                      </div>
                      {paymentMethod === 'pickup' && <div className="select-dot"></div>}
                    </div>
                  </>
                )}

                {/* Flouci - Wird nun IMMER angezeigt (unterhalb der jeweiligen Barzahlung) */}
                <div className="pay-option-card disabled">
                  <div className="pay-option-content">
                    <FaCreditCard className="pay-icon" />
                    <div className="pay-text-group">
                      <span className="pay-text">{t("cart_page.flouci_payment")}</span>
                      <span className="coming-soon">
                        {t("cart_page.flouci_coming_soon") || "Coming Soon"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TOTALS */}
            <div className="summary-details">
              <div className="summary-row">
                <span>{t("cart_page.subtotal")}</span>
                <span>{cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(3)}</span>
              </div>
              {isDelivery && (
                <div className="summary-row">
                  <span>{t("cart_page.shipping")}</span>
                  <span>{cart.reduce((sum, item) => sum + (Number(item.delprice) || 0), 0).toFixed(3)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>{t("cart_page.total")}</span>
                <span>{calculateTotal().toFixed(3)} <small>{t("price_suf")}</small></span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleNewOrder}
              disabled={isButtonDisabled}
            >
              {isSubmitting ? "..." : t("product_page.submit_order")}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;