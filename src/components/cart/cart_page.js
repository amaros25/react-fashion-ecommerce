import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../header/header.js";
import "./cart_page.css";
import DeliveryAddressForm from "./delivery_address_form";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const CartPage = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const SHIPPING_COST = 7.5;
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // -------------------------------
  // State variables
  // -------------------------------
  const [user, setUser] = useState(null); // stores user info
  const navigate = useNavigate();
  const [cart, setCart] = useState([]); // stores all cart items
  const [groupedCart, setGroupedCart] = useState({}); // grouped by seller
  const [showAddressForm, setShowAddressForm] = useState(false); // toggle delivery address form
  const [canOrder, setCanOrder] = useState(false);

  const [deliveryAddresses, setDeliveryAddresses] = useState({
    street: "",
    city: "",
    postalCode: "",
  });

  const [sellers, setSellers] = useState({});

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch(`${apiUrl}/sellers`);
        const data = await res.json();
        // map sellerId => seller object
        const sellerMap = data.reduce((acc, seller) => {
          acc[seller._id] = seller;
          return acc;
        }, {});
        setSellers(sellerMap);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSellers();
  }, []);


  // -------------------------------
  // Fetch user data on mount
  // -------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${apiUrl}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        console.log("🟢 user data:", data);

        // Show address form if no address exists
        if (data.address) {
            console.log("🟢 address", data.address);
          setDeliveryAddresses({
            street: data.address.street || "",
            city: data.address.city || "",
            postalCode: data.address.postalCode || "",
          });
          setShowAddressForm(false);
        } else {
          setShowAddressForm(true);
        }
          console.log("🟢 deliveryAddresses", deliveryAddresses);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  // -------------------------------
  // Set text direction based on language
  // -------------------------------
  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // -------------------------------
  // Load cart from localStorage and group by seller
  // -------------------------------
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);

    const grouped = savedCart.reduce((acc, item) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = [];
      acc[item.sellerId].push(item);
      return acc;
    }, {});
    setGroupedCart(grouped);
  }, []);

  // -------------------------------
  // Remove item from cart
  // -------------------------------
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

  const handle_new_order = async () => {
    if (!userId || !token) {
      toast.error(t("product_page.must_login"));
      return;
    }

    if (!user?.address?.street) {
      toast.error(t("enter_address_first"));
      return; 
    }

    try {
      // für jede Seller-Gruppe im Warenkorb eine Bestellung anlegen
      for (const [sellerId, items] of Object.entries(groupedCart)) {
        // Items in das Schema-Format umwandeln
        const formattedItems = items.map((item) => ({
          productId: item.productId,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        }));

        const totalPrice =
          items.reduce((sum, i) => sum + i.price * i.quantity, 0) + SHIPPING_COST;

        const orderData = {
          userId,
          sellerId,
          items: formattedItems,
          totalPrice,
          status: [{ update: "pending", date: new Date() }],
          notes: "", // optional
          paymentMethod: "Cash on Delivery", // oder z.B. "PayPal"
        };

        const res = await fetch(`${apiUrl}/orders/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        if (!res.ok) {
          throw new Error(`Fehler beim Erstellen der Bestellung für Seller ${sellerId}`);
        }
      }
      toast.error(t("orders_created_success"));
      localStorage.removeItem("cart");
      setCart([]);
      setGroupedCart({});
      navigate("/profile_user"); // oder eine andere Seite
    } catch (err) {
      console.error(err);
      toast.error(t("orders_created_error"));
    }
  };

  // -------------------------------
  // Navigate to product page
  // -------------------------------
  const handleGoToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // -------------------------------
  // Calculate subtotal for a seller (including shipping once)
  // -------------------------------
  const calculateSellerTotal = (sellerItems) => {
    const subtotal = sellerItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return subtotal + SHIPPING_COST;
  };

  // -------------------------------
  // Calculate total for all sellers
  // -------------------------------
  const calculateTotal = () => {
    return Object.entries(groupedCart).reduce((total, [_, items]) => {
      const sellerSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return total + sellerSubtotal + SHIPPING_COST;
    }, 0);
  };

  // -------------------------------
  // Save delivery address to backend
  // -------------------------------

  const handleSaveAddress = async (newData) => {
  try {
    const res = await fetch(`${apiUrl}/users/${userId}/updateContact`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newData),
    });

    if (!res.ok) throw new Error("Failed to save contact info");

    const updated = await res.json();
    setUser(updated.user);
    setDeliveryAddresses(updated.user.address);
    setShowAddressForm(false);
    toast.info(t("address_saved"));
  } catch (err) {
    console.error(err);
      toast.error(t("address_save_error"));
  }
};


  // -------------------------------
  // Render empty cart view
  // -------------------------------
  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <Header />
          <h2>🛒 {t("cart_page.empty_cart")}</h2>
        </div>
      </div>
    );
  }

  // -------------------------------
  // Render cart page
  // -------------------------------
  return (
    <div className="cart-page">
      <Header />
      <div className="cart-content">
        <h1 className="cart-title">🛍️ {t("cart_page.title")}</h1>

        {/* Cart items grouped by seller */}
        <div className="cart-container">
       {Object.entries(groupedCart).map(([sellerId, items]) => {
  const seller = sellers[sellerId]; // hole Seller-Infos
  return (
    <div key={sellerId} className="seller-section">
      {/* Seller Header */}
      {seller && (
        <div className="seller-header">
          <img src={seller.image} alt={seller.shopName} className="seller-image" />
          <h2 className="seller-name">{seller.shopName}</h2>
        </div>
      )}

      {/* Cart Items */}
      <div className="cart-items">
        {items.map((item, i) => (
          <div key={i} className="cart-item">
            <img
              src={item.image}
              alt={item.name}
              className="cart-item-image"
              onClick={() => handleGoToProduct(item.productId)}
            />
            <div
              className="cart-item-info"
              onClick={() => handleGoToProduct(item.productId)}
            >
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-details">
                Size: {item.size} | Color: {item.color}
              </p>
              <p className="cart-item-price">
                {item.quantity} × {item.price.toFixed(3)} {t("cart_page.price_suf")}
              </p>
            </div>
            <button
              className="remove-button"
              onClick={() => handleRemoveItem(sellerId, i)}
            >
              <FaTrash size={18} color="red" />
            </button>
          </div>
        ))}
      </div>

      {/* Seller subtotal + shipping */}
      <div className="seller-summary">
        <p>
          🚚 {t("cart_page.shipping_cost_once")} {SHIPPING_COST.toFixed(3)} {t("cart_page.price_suf")}
        </p>
        <h3>
          {t("cart_page.seller_subtotal")} {calculateSellerTotal(items).toFixed(3)} {t("cart_page.price_suf")}
        </h3>
      </div>
    </div>
  );
})}
        </div>
        {/* Cart total */}

        <div
          className={`cart-summary ${i18n.language === "ar" ? "rtl" : "ltr"}`}
        >
        
        <h2 className="total-price">
            {t("cart_page.total_price")}
            {calculateTotal().toFixed(3)} {t("cart_page.price_suf")}
          </h2>

          {/* Current Address */}
          {user?.address?.street && !showAddressForm && (
            <div className="current-address">
              <span>
                {user.address.street}, {user.address.postalCode} {user.address.city}
              </span>
              <button
                className="change-address-btn"
                onClick={() => setShowAddressForm(true)}
              >
                {t("cart_page.Change")}
              </button>
            </div>
          )}
        {/* Address Form (inline inside summary) */}
        {showAddressForm && (
          <div className="inline-address-form">
           <DeliveryAddressForm
              address={deliveryAddresses}
              phone={user?.phone}
              onSaveAddress={handleSaveAddress}
            />
          </div>
        )}
          {/* Order Button */}
            <button
          className="save-address-button"
          disabled={!canOrder && !user?.address?.street} // disabled until address saved or exists
          onClick={() => handle_new_order()} // your order handler
        >
          {t("product_page.submit_order")}
        </button>

        </div>

 
      </div>
    </div>
  );
};

export default CartPage;
