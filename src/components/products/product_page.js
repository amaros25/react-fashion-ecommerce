import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../utils/loading_spinner.js";
import RelatedProducts from "../related_products/related_product.js"
import ProductImage from './product_images.js'
import SellerInfo from "./seller_info.js";
import Breadcrumb from './breadcrumb.js';
import ProductInfoHeader from "./product_info_header.js";
import CommentProduct from './commentar_product.js';
import { useProductData } from './hooks/useProductData';
import { useSellerData } from './hooks/useSellerData';
import "./product_page.css";

function ProductPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const initialProduct = location.state?.product || null;
  const [product, setProduct] = useState(initialProduct);
  const [mainImage, setMainImage] = useState("");
  const { id } = useParams();
  const { product: loadedProduct } = useProductData(product ? null : id);

  // Reset product when navigating to a different product
  useEffect(() => {
    const newProduct = location.state?.product || null;
    setProduct(newProduct);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  }, [id, location.state]);

  useEffect(() => {
    if (!product && loadedProduct) {
      setProduct(loadedProduct);
    }
  }, [product, loadedProduct]);

  useEffect(() => {
    if (!product) return;

    if (Array.isArray(product.image) && product.image.length > 0) {
      setMainImage(product.image[0]);
    } else if (product.image) {
      setMainImage(product.image);
    }
    const direction = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", direction);
  }, [product, i18n.language]);

  const { seller, loading, error } = useSellerData(product?.sellerId);

  const [quantity, setQuantity] = useState(1);
  const [role, setRole] = useState(localStorage.getItem("role")?.toLowerCase());
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const userId = localStorage.getItem("userId");
  // New State for UI
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");



  const navigate = useNavigate();

  useEffect(() => {
    if (role === "seller") {
      toast.error(t("seller_cannot_buy_alter"));
    }
  }, [role, t]);

  const [refresh, setRefresh] = useState(false);

  //const { product, seller, mainImage, setMainImage } = useProductData(id, refresh);

  const availableSizes = product?.sizes
    ? Array.from(new Set(product.sizes.map(s => s.size)))
    : [];

  const availableColors = product?.sizes
    ? Array.from(new Set(product.sizes.map(s => s.color)))
    : [];

  if (!product || !seller) {
    return <LoadingSpinner />;
  }

  const handleBuyClick = (buyNow = false) => {
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

    const stockInfo = product.sizes.find(
      (s) => s.size === selectedSize && s.color === selectedColor
    );

    if (!stockInfo) {
      toast.error(t("product_page.invalid_selection"));
      return;
    }

    if (quantity > stockInfo.stock) {
      toast.error(`${t("product_page.exceeds_stock")} (${stockInfo.stock} ${t("product_page.available")})`);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const newItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      delprice: product.delprice || 0,
      image: mainImage,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      sellerId: seller._id,
    };

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        item.size === newItem.size &&
        item.color === newItem.color
    );

    if (existingIndex >= 0) {
      const totalQuantity = cart[existingIndex].quantity + newItem.quantity;
      cart[existingIndex].quantity = totalQuantity;
      if (!buyNow) toast.success(t("product_page.cart_updated"));
    } else {
      cart.push(newItem);
      if (!buyNow) toast.success(t("product_page.added_to_cart"));
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    if (buyNow) {
      navigate("/cart_page");
    }
  };

  // Check availability for color based on selected size
  const isColorAvailable = (color) => {
    if (!selectedSize) return true;
    return product.sizes.some(s => s.size === selectedSize && s.color === color && s.stock > 0);
  };

  // Check availability for size based on selected color
  const isSizeAvailable = (size) => {
    if (!selectedColor) return true;
    return product.sizes.some(s => s.size === size && s.color === selectedColor && s.stock > 0);
  };

  const canOrderProduct = () => {
    const lastState = product.states?.[product.states.length - 1]?.state;
    return role !== "seller" && lastState === 1;
  };

  return (
    <div className="product-page">

      <div className="breadcrumb-container">
        <Breadcrumb category={product.category} subCategory={product.subcategory} productName={product.name} />
      </div>

      <div className="product-main-content">
        {/* Left Column: Images */}
        <div className="product-left-column">
          <ProductImage
            mainImage={mainImage}
            setMainImage={setMainImage}
            product={product}
          />
        </div>

        {/* Right Column: Info & Actions */}
        <div className="product-right-column">
          <ProductInfoHeader product={product} userId={userId} />


          <div className="product-selection-section">

            {/* Size Selection */}
            <div className="selection-group">
              <label className="selection-label">{t("product_page.size")}</label>
              <div className="size-options">
                {availableSizes.map((sizeOption, index) => (
                  <button
                    key={index}
                    className={`size-button ${selectedSize === sizeOption ? 'selected' : ''} ${!isSizeAvailable(sizeOption) ? 'disabled' : ''}`}
                    onClick={() => setSelectedSize(sizeOption)}
                    disabled={!isSizeAvailable(sizeOption)}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
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

            {/* Quantity Selection */}
            <div className="selection-group">
              <label className="selection-label">{t("product_page.quantity")}</label>
              <div className="quantity-selector">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="product-description-text">
              <p className="description-label">{t("product_page.description")}</p>
              <p className={showFullDescription ? "expanded" : "collapsed"}>
                {product.description}
              </p>
              {product.description && product.description.length > 150 && (
                <button
                  className="show-more-btn"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
            <CommentProduct product={product} onReviewAdded={() => setRefresh(prev => !prev)} />

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="add-to-cart-btn"
                onClick={() => handleBuyClick(false)}

                disabled={!canOrderProduct()}
              >
                {t("product_page.add_to_cart")}
              </button>
              <button
                className="buy-now-btn"
                onClick={() => handleBuyClick(true)}
                disabled={!canOrderProduct()}
              >
                {t("product_page.buy_now")}
              </button>
            </div>



            {/* Seller Info Section */}
            <div
              className="seller-section-container"
              onClick={() => seller && seller._id && navigate(`/shop/${seller._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <h3 className="seller-section-title">{t("product_page.explore_seller")}</h3>
              <SellerInfo seller={seller} />
            </div>

          </div>
        </div>
      </div>

      <RelatedProducts
        category={product.category}
        currentProductId={product._id}
      />

    </div >
  );
}

export default ProductPage;
