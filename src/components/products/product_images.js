import React from "react";
import "./product_images.css";

function ProductImage({ mainImage, setMainImage, product }) {
  if (!product) return null;

  return (
    <div className="product-images">
      <img
        src={mainImage}
        alt={product.name}
        className="main-image"
        loading="lazy"
      />
      <div className="thumbnail-row">
        {Array.isArray(product.image) && product.image.length > 0 ? (
          product.image.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${product.name}-${index}`}
              className={`thumbnail ${mainImage === img ? "active" : ""}`}
              loading="lazy"
              onClick={() => setMainImage(img)}
            />
          ))
        ) : (
          product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="thumbnail active"
              loading="lazy"
              onClick={() => setMainImage(product.image)}
            />
          )
        )}
      </div>
    </div>
  );
}

export default ProductImage;
