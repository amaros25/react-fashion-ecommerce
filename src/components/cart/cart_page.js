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
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const [sellers, setSellers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDelivery, setIsDelivery] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch Sellers
  const getSellersByIds = async (sellerIds) => {
    try {
      const sellerMap = await fetchSellersByIds(sellerIds);
      console.log("sellerMap", sellerMap);
      setSellers(sellerMap);
    } catch (err) {
      console.error(err);
    }
  };

  // Load User Data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    console.log("CartPage userData: ", userData);
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUser(parsedData);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Load Cart
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("savedCart", savedCart);
    setCart(savedCart);
    let sellerIds = [];
    const grouped = savedCart.reduce((acc, item) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = [];
      console.log("acc: ", acc);
      acc[item.sellerId].push(item);
      sellerIds.push(item.sellerId);
      getSellersByIds(sellerIds);
      return acc;
    }, {});
    console.log("groupedCart", grouped);
    setGroupedCart(grouped);
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

    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);

    if (updatedGroup.length === 0) {
      const { [sellerId]: _, ...rest } = groupedCart;
      setGroupedCart(rest);
    } else {
      setGroupedCart({ ...groupedCart, [sellerId]: updatedGroup });
    }
  };

  // Submit Order
  const handleNewOrder = async () => {
    if (!userId || !token) {
      toast.error(t("product_page.must_login"));
      navigate("/login");
      return;
    }

    if (isDelivery && (!user?.address || !user?.city)) {
      toast.error(t("cart_page.address_required") || "Please add your delivery address first");
      return;
    }

    setIsSubmitting(true);

    try {
      await createMultipleOrders(groupedCart, userId, token, ORDER_STATUS.PENDING, isDelivery);
      toast.success(t("orders_created_success"));
      localStorage.removeItem("cart");
      setCart([]);
      setGroupedCart({});
      navigate("/profile_user");
    } catch (err) {
      console.error(err);
      toast.error(t("orders_created_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSellerTotal = (sellerItems) => {
    const subtotal = sellerItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = isDelivery ? sellerItems.reduce((sum, item) => sum + (item.delprice || 0), 0) : 0;
    return subtotal + shippingCost;
  };

  const calculateTotal = () => {
    return Object.entries(groupedCart).reduce((total, [_, items]) => {
      const sellerSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingCost = isDelivery ? items.reduce((sum, item) => sum + (item.delprice || 0), 0) : 0;
      return total + sellerSubtotal + shippingCost;
    }, 0);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page-empty" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <div className="empty-state">
          <FaShoppingBag className="empty-icon" />
          <h2>{t("cart_page.empty_cart")}</h2>
          <p>{t("cart_page.empty_desc") || "Looks like you haven't added anything to your cart yet."}</p>
          <button onClick={() => navigate("/")} className="continue-shopping-btn">
            {t("cart_page.continue_shopping") || "Continue Shopping"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="cart-header">
        <h1>{t("cart_page.title")}</h1>
        <span className="item-count">{cart.length} {t("cart_page.items") || "Items"}</span>
      </div>

      <div className="cart-layout">
        <div className="cart-items-section">
          {Object.entries(groupedCart).map(([sellerId, items]) => {
            const seller = sellers[sellerId];
            return (
              <div key={sellerId} className="seller-group">
                {seller && (
                  <div className="seller-header-modern">
                    <FaStore className="store-icon" />
                    <span className="cart-seller-name">{seller.shopName}</span>
                  </div>
                )}
                <div className="items-list">
                  {items.map((item, i) => (
                    <div key={i} className="cart-item-modern">
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
          })}
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
            {isDelivery && user?.address && user?.city && (
              <div className="delivery-address">
                <p className="address-label">📍 {t("cart_page.delivery_address") || "Delivery Address"}:</p>
                <p className="address-text">
                  {user.address}, {user.subCity && `${citiesData[cities[user.city]][user.subCity]}, `}{cities[user.city]}
                </p>
                {user.phone && (
                  <p className="address-text">
                    📞 {user.phone}
                  </p>
                )}
              </div>
            )}

            {isDelivery && (!user?.address || !user?.city) && (
              <div className="address-warning">
                ⚠️ {t("cart_page.add_address") || t("cart_page.missed_address_add_in_profile")}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : t("product_page.submit_order")}
              {!isSubmitting && <FaArrowRight />}
            </button>
            {/* <p className="secure-checkout-text">
              🔒 Secure Checkout
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
