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
import LoadingSpinner from "../loading/loading_spinner";
import "./cart_page.css";

const CartPage = () => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const { userId, token } = useAuth();
  const navigate = useNavigate();

  // Fetching user profile and cart data using custom hook managers
  const { user, loading: userLoading } = useUserProfileManager(userId, token); //TODO: check if this is the best way to handle this
  const {
    cart,
    groupedCart,
    sellersMap,
    isLoadingSellers,
    isSubmitting,
    handleRemoveItem,
    submitGroups
  } = useCartManager(userId, token, queryClient); //TODO: check if this is the best way to handle this

  // Local state for delivery preference and payment selection
  const [isDelivery, setIsDelivery] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Reset scroll position to top when the page mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Validates user data and payment method before submitting the order.
   * If successful, redirects the user to their profile page.
   */
  const handleNewOrder = async () => {
    if (!user?.phone || !user?.address) {
      toast.error(t("cart_page.profile_incomplete")); //TODO: translate this message
      return;
    }
    if (!paymentMethod) {
      toast.error(t("cart_page.payment_method_required")); //TODO: translate this message
      return;
    }

    const result = await submitGroups(user, isDelivery, ORDER_STATUS.PENDING, paymentMethod);
    if (result.success && !result.redirecting) navigate("/profile_user");
    else if (result.loginRequired) navigate("/login");
  };

  /**
   * Calculates the shipping cost for a specific seller group.
   */
  const calculateSellerShipping = (items) => {
    return isDelivery ? Math.max(...items.map(i => Number(i.delprice) || 0)) : 0;
  };

  /**
   * Calculates the total for a specific seller group, 
   * including shipping if delivery is selected.
   */
  const calculateSellerTotal = (items) => {
    const sub = items.reduce((s, i) => s + Number(i.price) * (i.quantity || 1), 0); // Reduce is a higher-order function that reduces an array to a single value, calculating the subtotal of the items
    const ship = calculateSellerShipping(items); // Calculate the shipping cost for the seller group
    console.log("sub", sub);
    console.log("ship", ship);
    return sub + ship;
  };

  const calculateSellerTotalWithoutShipping = (items) => {
    const sub = items.reduce((s, i) => s + Number(i.price) * (i.quantity || 1), 0); // Reduce is a higher-order function that reduces an array to a single value, calculating the subtotal of the items
    console.log("sub", sub);
    return sub;
  };

  /**
   * Calculates the grand total for all items across all sellers.
   */
  const calculateTotal = () => {
    return Object.entries(groupedCart).reduce((acc, [_, items]) => acc + calculateSellerTotal(items), 0);
  };

  /**
   * Calculates the total shipping cost for all sellers.
   */
  const calculateTotalShipping = () => {
    if (!isDelivery) return 0;

    // Wir gehen durch jede Gruppe (Seller) im groupedCart
    return Object.values(groupedCart).reduce((totalShip, items) => {
      // Finde den maximalen Lieferpreis in dieser spezifischen Gruppe
      const maxForSeller = Math.max(...items.map(i => Number(i.delprice) || 0));
      return totalShip + maxForSeller;
    }, 0);
  };

  // Derived state for button handling and RTL support
  const isProfileComplete = user?.phone && user?.address;
  const isButtonDisabled = isSubmitting || !isProfileComplete || !paymentMethod || !cart.length;

  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  //Loading
  if (userLoading) {
    return (
      <div className="cart-page-loading" dir={dir}>
        <div className="loading-state">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  // Empty State UI
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
        {/* LEFT COLUMN: List of products grouped by Seller */}
        <div className="cart-items-section">
          {Object.entries(groupedCart).map(([sellerId, items]) => {
            const seller = sellersMap[sellerId];
            const sellerShipping = calculateSellerShipping(items);
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
                      <div className="item-image-wrapper" onClick={() => navigate(`/product/${item.productId}`)}>
                        <img src={item.image} alt={item.name} />
                      </div>

                      <div className="item-details">
                        <div className="item-info-top">
                          <h3 className="item-title-large" onClick={() => navigate(`/product/${item.productId}`)}>
                            {item.name}
                          </h3>
                          <button className="remove-btn-modern" onClick={() => handleRemoveItem(sellerId, i)}>
                            <FaTrash />
                          </button>
                        </div>

                        {/* Product specifications like Color and Size */}
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

                        {/* Breakdown of item price and shipping fee */}
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

                {/* Subtotal shown only if multiple sellers are involved */}
                {Object.keys(groupedCart).length > 1 && (
                  <div className="seller-footer-mini">
                    <span>
                      {t("cart_page.subtotal")}: {calculateSellerTotalWithoutShipping(items).toFixed(3)} <small>{t("price_suf")}</small>
                    </span>
                    {isDelivery && (
                      <div className="delivery-seller-price">
                        <span>{t("cart_page.shipping")}: </span>
                        <span>{sellerShipping.toFixed(3)} <small>{t("price_suf")}</small></span>
                        <span> ({t("cart_page.max_rate_applied")})</span>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Order Summary, Delivery Options, and Payment */}
        <aside className="cart-summary-section">
          <div className="summary-card">
            <h2 className="summary-title">{t("cart_page.order_summary")}</h2>

            {/* Toggle between Delivery and Store Pickup */}
            <div className="delivery-toggle-modern">
              <button className={`toggle-tab ${isDelivery ? 'active' : ''}`} onClick={() => setIsDelivery(true)}>
                {t("cart_page.delivery")}
              </button>
              <button className={`toggle-tab ${!isDelivery ? 'active' : ''}`} onClick={() => setIsDelivery(false)}>
                {t("cart_page.pickup")}
              </button>
            </div>

            {/* User Address/Phone Verification Block */}
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

            {/* Payment Method Selection */}
            <div className="payment-selection-modern">
              <span className="info-label">{t("cart_page.payment_method")}</span>
              <div className="payment-stack">
                {isDelivery ? (
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
                ) : (
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
                )}

                {/* Placeholder for future payment integrations */}
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

            {/* Final Totals and Checkout Button */}
            <div className="summary-details">
              <div className="summary-row">
                <span>{t("cart_page.subtotal")}</span>
                <span>{cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(3)} <small>{t("price_suf")}</small></span>
              </div>
              {isDelivery && (
                <div className="summary-row">
                  <span>{t("cart_page.shipping")}</span>
                  <span>{calculateTotalShipping().toFixed(3)} <small>{t("price_suf")}</small></span>
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