import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import './product_card.css';
import { BsBookmarkHeart, BsBookmarkHeartFill } from "react-icons/bs";
import { toast } from "react-toastify";

function ProductCard({ product, onProductRemoved, onClick }) {
  const { t, i18n } = useTranslation();

  // Fallback für Bilder, falls das Array leer oder undefined ist
  const [currentImage, setCurrentImage] = useState(
    product?.images?.length > 0 ? product.images[0] : "/placeholder.jpg"
  );

  const productId = product?.id;
  const [showPopup, setShowPopup] = useState(false);
  const userId = localStorage.getItem("userId");
  const savedProductsKey = `saved_products_${userId}`;

  // Sicherer Zugriff auf LocalStorage
  const getSavedProducts = () => {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(savedProductsKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error parsing saved products:", error);
      return [];
    }
  };

  const [isProductSaved, setIsProductSaved] = useState(getSavedProducts().includes(productId));

  // Aktualisierung wenn sich das Produkt-Objekt ändert (z.B. Pagination)
  useEffect(() => {
    if (product?.images?.length > 0) {
      setCurrentImage(product.images[0]);
    }
    setIsProductSaved(getSavedProducts().includes(productId));
  }, [product, productId]);

  const toggleSavedProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      toast.info(t("product_page.login_to_save"));
      return;
    }

    let savedProducts = getSavedProducts();
    const alreadySaved = savedProducts.includes(productId);

    if (alreadySaved) {
      savedProducts = savedProducts.filter(id => id !== productId);
      setIsProductSaved(false);
      toast.info(t("product_page.remove_from_saved"));
      if (onProductRemoved) onProductRemoved(productId);
    } else {
      savedProducts.push(productId);
      setIsProductSaved(true);
      toast.success(t("product_page.add_to_saved"));
    }
    localStorage.setItem(savedProductsKey, JSON.stringify(savedProducts));
  };

  // Daten aus dem variants JSONB-Feld extrahieren
  const thumbnails = Array.isArray(product?.images) ? product.images.slice(0, 4) : [];
  const availableSizes = product?.variants ? [...new Set(product.variants.map(v => v.size))] : [];
  const availableColors = product?.variants ? [...new Set(product.variants.map(v => v.color))] : [];

  // Preis sicherstellen (Postgres Decimal kommt oft als String)
  const price = Number(product?.price || 0);

  const handleExpandClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopup(true);
  };

  return (
    <>
      <div className="product-card-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <Link
          to={`/product/${productId}`}
          state={{ product }}
          className="product-card-item"
          onClick={onClick}
        >
          <div className="product-image-wrapper">
            <img
              src={currentImage}
              alt={product?.name}
              className="product-card-image"
              loading="lazy"
            />
            <div className="expand-icon" onClick={handleExpandClick}>⤢</div>
            <div
              onClick={toggleSavedProduct}
              className={`save-product-card-icon ${isProductSaved ? 'saved' : ''}`}
            >
              {isProductSaved ? (
                <BsBookmarkHeartFill className="star-icon" size={22} />
              ) : (
                <BsBookmarkHeart className="star-icon" size={22} />
              )}
            </div>
          </div>
        </Link>

        <div className="product-thumbnails">
          {thumbnails.map((img, index) => (
            <div
              key={index}
              className={`thumbnail-wrapper ${currentImage === img ? 'active' : ''}`}
              onMouseEnter={() => setCurrentImage(img)}
              onClick={(e) => {
                e.preventDefault();
                setCurrentImage(img);
              }}
            >
              <img src={img} alt="" className="thumbnail-image" />
            </div>
          ))}
          {product?.images?.length > 4 && (
            <span className="more-images">+{product.images.length - 4}</span>
          )}
        </div>

        <Link to={`/product/${productId}`} className="product-info-link" onClick={onClick}>
          <div className="product-info">
            <div className="product-name" title={product?.name}>{product?.name}</div>
            <div className="product-colors-display">
              {availableColors.map((color, index) => (
                <div
                  key={index}
                  className="color-swatch-small"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <p className="product-color-desc">
              {t("sizes")}: {availableSizes.length > 0 ? availableSizes.join(", ") : t("no_sizes")}
            </p>
            <div className="product-price-row">
              {product?.discountedPercent > 0 ? (
                <>
                  <span className="product-price-original">
                    {price.toFixed(2)} {t("price_suf")}
                  </span>
                  <span className="product-price discounted">
                    {(price * (1 - product.discountedPercent / 100)).toFixed(2)} {t("price_suf")}
                  </span>
                  <span className="discount-badge">
                    -{product.discountedPercent}%
                  </span>
                </>
              ) : (
                <span className="product-price"> {price.toFixed(2)} {t("price_suf")}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {showPopup && (
        <div className="image-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-popup" onClick={() => setShowPopup(false)}>&times;</span>
            <img src={currentImage} alt={product?.name} className="image-popup-img" />
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;