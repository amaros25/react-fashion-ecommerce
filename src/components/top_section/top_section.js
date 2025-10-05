import React from 'react';
import { Link } from "react-router-dom";
import '../top_section/top_section.css';

function TopSection({ title, products }) {
  return (
    <div className="section-box">
      <h3 className="section-title">{title}</h3>
      <div className="section-product-grid">
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
            <span className="new-price">{product.price.toFixed(2)} DT</span>
            {product.discountedPercent > 0 ? (
                <span className="old-price">{(product.price / (1 - product.discountedPercent / 100)).toFixed(2)} DT</span>
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
