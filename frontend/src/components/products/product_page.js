import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

// Components
import LoadingSpinner from "../utils/loading_spinner.js";
import RelatedProducts from "../related_products/related_product.js"
import ProductImage from './product_images.js'
import SellerInfo from "./seller_info.js";
import Breadcrumb from './breadcrumb.js';
import ProductInfoHeader from "./product_info_header.js";
import CommentProduct from './commentar_product.js';

// Managers & Styles
import "./product_page.css";
import { useProductPageManager } from '../api_managers/useProductPageManager';

function ProductPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // --- 1. ID Validation & Manager Setup ---

  const initialProductFromState = location.state?.product;
  console.log("initialProductFromState", initialProductFromState);

  const validatedInitialProduct = useMemo(() => {
    if (initialProductFromState && String(initialProductFromState.id) === String(id)) {
      return initialProductFromState;
    }
    return null;
  }, [id, initialProductFromState]);

  // Use the manager - it returns combined loading and error states
  const {
    product,
    seller,
    loading, // This replaces productLoading and sellerLoading
    error    // This replaces productError and sellerError
  } = useProductPageManager(id, validatedInitialProduct);

  // --- 2. Local UI State ---
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const role = localStorage.getItem("role")?.toLowerCase();
  const isLoggedIn = !!localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // --- 3. Synchronize UI on Product Change ---
  useEffect(() => {
    if (product) {
      const images = product.images || [];
      setMainImage(images.length > 0 ? images[0] : "/placeholder.jpg");
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
    }
  }, [product?.id]);

  // --- 4. Derived State (Variants) ---
  const variants = product?.variants || [];
  const availableSizes = useMemo(() => [...new Set(variants.map(v => v.size))], [variants]);
  const availableColors = useMemo(() => [...new Set(variants.map(v => v.color))], [variants]);

  const isColorAvailable = (color) => {
    if (!selectedSize) return true;
    return variants.some(v => v.size === selectedSize && v.color === color && v.stock > 0);
  };

  const isSizeAvailable = (size) => {
    if (!selectedColor) return true;
    return variants.some(v => v.color === selectedColor && v.size === size && v.stock > 0);
  };

  const canOrderProduct = () => {
    if (!product || variants.length === 0 || product.status === 0) return false;
    return role !== "seller" && variants.some(v => v.stock > 0);
  };

  useEffect(() => {
    if (role === "seller") {
      toast.error(t("seller_cannot_buy_alter"));
    }
  }, [role, t]);

  // Auto-select if only one option is available
  useEffect(() => {
    if (!product || variants.length === 0) return;
    const inStockSizes = availableSizes.filter(size => isSizeAvailable(size));
    if (inStockSizes.length === 1 && !selectedSize) setSelectedSize(inStockSizes[0]);

    const inStockColors = availableColors.filter(color => isColorAvailable(color));
    if (inStockColors.length === 1 && !selectedColor) setSelectedColor(inStockColors[0]);
  }, [product, selectedSize, selectedColor, availableSizes, availableColors]);

  // --- 5. Global Guards (Loading & Error) ---

  // Only show full-page spinner if we have NO product data at all
  if (loading && !product) return <LoadingSpinner />;

  // Show error only if we have no product to display
  if (error && !product) {
    return (
      <div className="error-container">
        <p>{t(error) || t("error_loading_product")}</p>
      </div>
    );
  }

  // If no product after loading finishes
  if (!product) return null;

  // --- 6. Handlers ---
  const handleBuyClick = (buyNow = false) => {
    if (product.status === 0) {
      toast.error(t("product_pending_admin_conf"));
      return;
    }
    if (role === "seller") {
      toast.error(t("seller_cannot_buy_alter"));
      return;
    }
    if (!selectedSize || !selectedColor) {
      toast.warn(t("product_page.select_size_alert"));
      return;
    }
    if (!isLoggedIn) {
      toast.info(t("product_page.must_login"));
      return;
    }

    const selectedVariant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
    if (!selectedVariant || selectedVariant.stock < quantity) {
      toast.error(t("product_page.exceeds_stock"));
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingInCart = cart.find(
      (item) =>
        item.productId === product.id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );

    const cartQuantity = existingInCart ? existingInCart.quantity : 0;
    const totalRequested = cartQuantity + quantity;

    if (totalRequested > selectedVariant.stock) {
      toast.error(`${t("product_page.exceeds_stock")} (${selectedVariant.stock} ${t("product_page.available")})`);
      return;
    }

    const newItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      delprice: product.delprice || 0,
      image: mainImage,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      sellerId: product.sellerId || seller?.id,
      variantId: selectedVariant.id,
    };

    if (existingInCart) {
      const existingIndex = cart.findIndex(item => item === existingInCart);
      cart[existingIndex].quantity = totalRequested;
      if (!buyNow) toast.success(t("product_page.cart_updated"));
    } else {
      cart.push(newItem);
      if (!buyNow) toast.success(t("product_page.added_to_cart"));
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    if (buyNow) navigate("/cart_page");
  };

  return (
    <div className="product-page" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="breadcrumb-container">
        <Breadcrumb
          category={product.category}
          subCategory={product.subcategory}
          productName={product.name}
        />
      </div>

      <div className="product-main-content">
        <div className="product-left-column">
          <ProductImage
            mainImage={mainImage}
            setMainImage={setMainImage}
            product={product}
          />
        </div>

        <div className="product-right-column">
          <ProductInfoHeader product={product} userId={userId} />
          <div className="product-selection-section">

            <div className="selection-group">
              <label className="selection-label">{t("product_page.size")}</label>
              <div className="size-options">
                {availableSizes.map((size, index) => (
                  <button
                    key={index}
                    className={`size-button ${selectedSize === size ? 'selected' : ''} ${!isSizeAvailable(size) ? 'disabled' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    disabled={!isSizeAvailable(size)}
                  >
                    {size === "OS" ? t("product_page.one_size") : size}
                  </button>
                ))}
              </div>
            </div>

            <div className="selection-group">
              <label className="selection-label">{t("product_page.color")}</label>
              <div className="color-options">
                {availableColors.map((color, index) => (
                  <div
                    key={index}
                    className={`color-swatch-container ${selectedColor === color ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                ))}
              </div>
            </div>

            <div className="selection-group">
              <label className="selection-label">{t("product_page.quantity")}</label>
              <div className="quantity-selector">
                <button className="quantity-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button className="quantity-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="product-description-text">
              <p className="description-label">{t("product_page.description")}</p>
              <p className={showFullDescription ? "expanded" : "collapsed"}>
                {product.description}
              </p>
              {product.description?.length > 250 && (
                <button className="show-more-btn" onClick={() => setShowFullDescription(!showFullDescription)}>
                  {showFullDescription ? t("product_page.show_less") : t("product_page.show_more")}
                </button>
              )}
            </div>

            <CommentProduct product={product} />

            <div className="action-buttons">
              <button className="add-to-cart-btn" onClick={() => handleBuyClick(false)} disabled={!canOrderProduct()}>
                {t("product_page.add_to_cart")}
              </button>
              <button className="buy-now-btn" onClick={() => handleBuyClick(true)} disabled={!canOrderProduct()}>
                {t("product_page.buy_now")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="seller-section-container"
        onClick={() => {
          if (seller) {
            console.log("seller.shopSlug:", seller.shopSlug);
            const identifier = seller.shopSlug || seller.id;
            navigate(`/${identifier}`);
          }
        }}
        style={{ cursor: 'pointer' }}>
        <h3 className="seller-section-title">{t("product_page.explore_seller")}</h3>
        <SellerInfo seller={seller} />
      </div>
      {product.category !== undefined && (
        <RelatedProducts category={product.category} currentProductId={product.id} />
      )}
    </div>
  );
}

export default ProductPage;