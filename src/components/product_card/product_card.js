import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import './product_card.css';
import { BsBookmarkHeart } from "react-icons/bs";
import { BsBookmarkHeartFill } from "react-icons/bs";
import { toast } from "react-toastify";

function ProductCard({ product, onProductRemoved, onClick }) {

  const { t, i18n } = useTranslation();
  const [currentImage, setCurrentImage] = useState(product.image[0]);
  const [showPopup, setShowPopup] = useState(false);
  const userId = localStorage.getItem("userId");
  const savedProductsKey = `saved_products_${userId}`;
  const getSavedProducts = () => {
    const saved = localStorage.getItem(savedProductsKey);
    return saved ? JSON.parse(saved) : [];
  };


  const toggleSavedProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const savedProducts = getSavedProducts();
    const isProductSaved = savedProducts.includes(product._id);

    if (isProductSaved) {
      const updatedProducts = savedProducts.filter(id => id !== product._id);
      localStorage.setItem(savedProductsKey, JSON.stringify(updatedProducts));
      setIsProductSaved(false);
      toast.info(t("product_page.remove_from_saved"));

      // Call callback to update parent component
      if (onProductRemoved) {
        onProductRemoved(product._id);
      }
    } else {
      // Product add to saved products list
      if (userId) {
        savedProducts.push(product._id);
        localStorage.setItem(savedProductsKey, JSON.stringify(savedProducts));
        setIsProductSaved(true);
        toast.success(t("product_page.add_to_saved"));
      } else {
        toast.info(t("product_page.login_to_save"));
      }
    }
  };
  const [isProductSaved, setIsProductSaved] = useState(getSavedProducts().includes(product._id));

  const translateColor = (color) => {
    if (!color) return "";
    const colorKey = color.toLowerCase();
    const translated = t(`product_colors.${colorKey}`);
    return translated !== `product_colors.${colorKey}` ? translated : color;
  };

  const handleExpandClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopup(true);
  };

  const closePopup = (e) => {
    e.stopPropagation();
    setShowPopup(false);
  };

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  // Calculate unique color count
  const uniqueColors = [...new Set(product.sizes.map(s => s.color))].length;

  // Limit thumbnails to 4
  const thumbnails = product.image.slice(0, 4);

  return (
    <>
      <div className="product-card-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          state={{ product }}
          className="product-card-item"
          onClick={onClick}
        >

          <div className="product-image-wrapper">
            <img
              src={currentImage}
              alt={product.name}
              className="product-card-image"
              loading="lazy" />
            <div className="expand-icon" onClick={handleExpandClick}>⤢</div>
            <div
              onClick={toggleSavedProduct}
              className={`save-product-card-icon ${isProductSaved ? 'saved' : ''}`}
            >
              {isProductSaved ? (
                <BsBookmarkHeartFill className="star-icon" size={22} /> // Saved
              ) : (
                <BsBookmarkHeart className="star-icon" size={22} /> // Not saved
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
              <img
                src={img}
                alt={`Thumbnail ${index}`}
                className="thumbnail-image"
              />
            </div>
          ))}
          {product.image.length > 4 && (
            <span className="more-images">+{product.image.length - 4}</span>
          )}
        </div>

        <Link to={`/product/${product._id}`} className="product-info-link" onClick={onClick}>
          <div className="product-info">
            <h2 className="product-name" title={product.name}>{product.name}</h2>
            <div className="product-colors-display">
              {[...new Set(product.sizes.map(s => s.color))].map((color, index) => (
                <div
                  key={index}
                  className="color-swatch-small"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <p className="product-color-desc">{t("sizes")}: {product.sizes.map(sizeObj => sizeObj.size).join(", ")} </p>
            <div className="product-price-row">
              {product.discountedPercent > 0 ? (
                <>
                  <span className="product-price-original">
                    {product.price} {t("price_suf")}
                  </span>
                  <span className="product-price discounted">
                    {(product.price * (1 - product.discountedPercent / 100)).toFixed(0)} {t("price_suf")}
                  </span>
                  <span className="discount-badge">
                    -{product.discountedPercent}%
                  </span>
                </>
              ) : (
                <span className="product-price"> {product.price} {t("price_suf")}</span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {showPopup && (
        <div className="image-popup-overlay" onClick={closePopup}>
          <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-popup" onClick={closePopup}>&times;</span>
            <img src={currentImage} alt={product.name} className="image-popup-img" />
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;
