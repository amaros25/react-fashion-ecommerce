import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaTrash, FaArrowRight, FaShoppingBag, FaStore } from "react-icons/fa";
import { toast } from "react-toastify";
import { fetchSellersByIds, createMultipleOrders } from "./hooks/api";
import "./cart_page.css";
import { cities, citiesData } from '../utils/const/cities';
import { ORDER_STATUS } from "../utils/const/order_status";

const CartPage = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const [sellers, setSellers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDelivery, setIsDelivery] = useState(true);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch Sellers
  const getSellersByIds = async (sellerIds) => {
    try {
      const sellerMap = await fetchSellersByIds(sellerIds, t);
      setSellers(sellerMap);
    } catch (err) {
      toast.error(t("errors.fetch_sellers") || "Error loading sellers. Please try again later.");
    }
  };

  // Load User Data from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");
    const storedUserData = localStorage.getItem("userData");
    setUserId(storedUserId);
    setToken(storedToken);
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUser(parsedData);
      } catch (err) {
        toast.error(t("errors.parse_user_data") || "Error parsing user data. Please try again later.");
      }
    }
  }, []);

  // Load Cart
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
    let sellerIds = [];
    const grouped = savedCart.reduce((acc, item) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = [];
      acc[item.sellerId].push(item);
      if (!sellerIds.includes(item.sellerId)) {
        sellerIds.push(item.sellerId);
      }
      return acc;
    }, {});
    setGroupedCart(grouped);
    if (sellerIds.length > 0) {
      getSellersByIds(sellerIds);
    }
  }, []);

  // Remove Item
  const handleRemoveItem = (sellerId, index) => {
    const updatedGroup = groupedCart[sellerId].filter((_, i) => i !== index);
    const newCart = cart.filter(
      (item) =>
        !(
          item.sellerId === sellerId &&
          groupedCart[sellerId].indexOf(item) === index
        )
    );
    setCart(newCart);
    if (updatedGroup.length === 0) {
      const { [sellerId]: _, ...rest } = groupedCart;
      setGroupedCart(rest);
    } else {
      setGroupedCart({ ...groupedCart, [sellerId]: updatedGroup });
    }
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // Submit Order
  const handleNewOrder = async () => {
    if (!userId || !token) {
      toast.error(t("product_page.must_login"));
      navigate("/login");
      return;
    }

    if (isDelivery && (!user?.address)) {
      toast.error(t("cart_page.address_required") || "Please add your delivery address first");
      return;
    }

    setIsSubmitting(true);

    try {
      await createMultipleOrders(groupedCart, userId, token, ORDER_STATUS.PENDING, isDelivery, t);
      toast.success(t("orders_created_success"));
      localStorage.removeItem("cart");
      setCart([]);
      setGroupedCart({});
      navigate("/profile_user");
    } catch (err) {
      toast.error(t("orders_created_error") || "An error occurred while creating your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSellerTotal = (sellerItems) => {
    const subtotal = sellerItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    const shippingCost = isDelivery ? sellerItems.reduce((sum, item) => sum + (item.delprice || 0), 0) : 0;
    return subtotal + shippingCost;
  };

  const calculateTotal = () => {
    return Object.entries(groupedCart).reduce((total, [_, items]) => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      );
      const shippingCost = isDelivery ? items.reduce((sum, item) => sum + (item.delprice || 0), 0) : 0;
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
              const seller = sellers[sellerId];
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
                      <span className="cart-seller-name">Loading...</span>
                    </div>
                  )}
                  <div className="items-list">
                    {items.map((item, i) => (
                      <div key={item.productId} className="cart-item-modern">
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
                            <span className="price">
                              {(item.price * item.quantity).toFixed(3)} {t("price_suf")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="seller-subtotal">
                    <span>{t("cart_page.shipping")}: {items.reduce((sum, item) => sum + (item.delprice || 0), 0).toFixed(3)} {t("price_suf")}</span>
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
                <span>{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(3)} {t("price_suf")}</span>
              </div>
              {isDelivery && (
                <div className="summary-row">
                  <span>{t("cart_page.shipping")}</span>
                  <span>{cart.reduce((sum, item) => sum + (item.delprice || 0), 0).toFixed(3)} {t("price_suf")}</span>
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
