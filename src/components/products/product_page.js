import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./loading_spinner.js";
import RelatedProducts from "../related_products/related_product.js"
import ProductImage from './product_images.js'
import SellerInfo from "./seller_info.js";
import Breadcrumb from './breadcrumb.js';
import "./product_page.css";
import ProductInfoHeader from "./product_info_header.js";
import CommentProduct from './commentar_product.js';

function ProductPage() {

  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [seller, setSeller] = useState(null);
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

  useEffect(() => {
    const direction = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", direction);
  }, [i18n.language]);

  const navigate = useNavigate();

  useEffect(() => {
    if (role === "seller") {
      toast.error(t("seller_cannot_buy_alter"));
    }
  }, [role, t]);

  const availableSizes = product?.sizes
    ? Array.from(new Set(product.sizes.map(s => s.size)))
    : [];

  const availableColors = product?.sizes
    ? Array.from(new Set(product.sizes.map(s => s.color)))
    : [];

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (Array.isArray(data.image) && data.image.length > 0) {
          setMainImage(data.image[0]);
        } else if (data.image) {
          setMainImage(data.image);
        }

        if (data.sellerId) {
          fetch(`${apiUrl}/sellers/${data.sellerId}`)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Error fetching seller: ${res.status}`);
              }
              return res.json();
            })
            .then((sellerData) => {
              setSeller(sellerData);
            })
            .catch((err) => {
              console.error("Error loading seller:", err);
              setSeller(null);
            });
        } else {
          setSeller(null);
        }
      })
      .catch((err) => {
        console.error("Error loading product:", err);
      });
  }, [id, apiUrl, refresh]);

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




  return (
    <div className="product-page">

      <div className="breadcrumb-container">
        <Breadcrumb category={product.category} productName={product.name} />
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
                  >
                    <div
                      className="color-swatch"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  </div>
                ))}
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
                disabled={role === "seller"}
              >
                {t("product_page.add_to_cart")}
              </button>
              <button
                className="buy-now-btn"
                onClick={() => handleBuyClick(true)}
                disabled={role === "seller"}
              >
                {t("product_page.buy_now")}
              </button>
            </div>



            {/* Seller Info Section */}
            <div className="seller-section-container">
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

    </div>
  );
}

export default ProductPage;
