import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./order_items.css";

export default function OrderItem({ item, product, order, t, isLast }) {
  const navigate = useNavigate();

  const handleChatWithSeller = (e) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    navigate('/chat', {
      state: {
        newOrderNumber: order.orderNumber,
        sellerId: order.sellerId,
        newChatType: 'order'
      }
    });
  };

  // Helper to determine if color is hex
  const isHexColor = (color) => /^#[0-9A-F]{6}$/i.test(color);

  return (
    <Link to={`/product/${item.productId}`} className="order-item-link">
      <div className="order-item-card">
        <div className="order-item-left">
          <div className="order-item-image-container">
            {product?.image?.[0] ? (
              <img src={product.image[0]} alt={product.name} className="order-product-image" />
            ) : (
              <div className="order-product-placeholder"></div>
            )}
          </div>

          <div className="order-product-info">
            <p className="order-product-title">{product?.name || t("loading_product")}</p>

            <div className="order-product-variants">
              <div className="variant-item">
                <span className="variant-label">{t("size")}:</span>
                <span className="variant-value">{item.size}</span>
              </div>

              <div className="variant-item">
                <span className="variant-label">{t("color")}:</span>
                {isHexColor(item.color) ? (
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: item.color }}
                    title={item.color}
                  ></span>
                ) : (
                  <span className="variant-value">
                    {t(`product_colors.${item.color.toLowerCase()}`, { defaultValue: item.color })}
                  </span>
                )}
              </div>

              <div className="variant-item">
                <span className="variant-label">{t("quantity")}:</span>
                <span className="variant-value">{item.quantity}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-item-right">
          <button className="chat-with-seller-btn" onClick={handleChatWithSeller}>
            {t("chat_seller") || "Chat with Seller"}
          </button>
        </div>
      </div>
    </Link>
  );
}
