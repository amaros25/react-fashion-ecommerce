import React from "react";
import "./product_images.css";

function ProductImage({ mainImage, setMainImage, product }) {
  if (!product) return null;
  const allImages = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="product-images">
      <img
        src={mainImage || "/placeholder-image.png"}
        alt={product.name}
        className="main-image"
        loading="lazy"
      />
      <div className="thumbnail-row">
        {allImages.length > 1 ? (
          allImages.map((img, index) => (
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
          mainImage && (
            <img
              src={mainImage}
              alt={product.name}
              className="thumbnail active"
              loading="lazy"

            />
          )
        )}
      </div>
    </div>
  );
}

export default ProductImage;
