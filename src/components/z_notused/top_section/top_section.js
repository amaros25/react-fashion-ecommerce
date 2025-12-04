import React, { useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import './top_section.css';

function TopSection({ title, products }) {
  const productGridRef = useRef(null);
  const isRTL = document.documentElement.dir === 'rtl';
  useEffect(() => {
    if (productGridRef.current) {
      productGridRef.current.scrollLeft = 0;
    }
  }, [products]);

  useEffect(() => {
    if (productGridRef.current) {
      if (isRTL) {
        productGridRef.current.scrollLeft = productGridRef.current.scrollWidth;
      } else {
        productGridRef.current.scrollLeft = 0;
      }
    }
  }, [products, isRTL]);


  return (
    <div className="section-box">
      <h3 className="section-title">{title}</h3>
      <div className="section-product-grid" ref={productGridRef} dir={isRTL ? "rtl" : "ltr"}>
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="product-card"
          >
            <img src={product.image[0]} alt={product.name} loading="lazy" />
            <p className="product-name">{product.name}</p>
            <div className="price-area">
              <div className="price-row">
                <span className="new-price">{product.price.toFixed(3)} {t("price_suf")}</span>
                {product.discountedPercent > 0 ? (
                  <span className="old-price">{(product.price / (1 - product.discountedPercent / 100)).toFixed(3)} {t("price_suf")}</span>
                ) : (
                  <span className="old-price-placeholder">&nbsp;</span>
                )}
              </div>
              <div className="discount">
                {product.discountedPercent > 0 ? `-${product.discountedPercent}% Solde` : '\u00A0'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TopSection;
