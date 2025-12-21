import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./order_items.css";

export default function OrderItem({ item, product, order, t, isLast, chatRole = 'seller' }) {
  const navigate = useNavigate();

  const STATUS_CONFIRMED = 1;
  const PICKED_UP = 41;
  const RETURN_RECEIVED = 24;
  const DELIVERED = 23;
  const FAILED_DELIVERY = 25;
  const NO_RESPONSE = 10;
  const CANCELLED_USER = 30;
  const CANCELLED_SELLER = 31;
  const PICK_UP_FAILED = 42;

  const states_no_chat = [STATUS_CONFIRMED, PICKED_UP, RETURN_RECEIVED, DELIVERED, FAILED_DELIVERY, NO_RESPONSE, CANCELLED_USER, CANCELLED_SELLER, PICK_UP_FAILED];
  const handleChat = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isSellerView = chatRole === 'buyer';
    const targetId = isSellerView ? order.user?._id : order.sellerId;
    const chatType = 'order';

    if (!targetId) {
      console.error("Chat target ID not found");
      return;
    }

    navigate('/chat', {
      state: {
        newOrderNumber: order.orderNumber,
        partnerId: targetId,
        newChatType: chatType
      }
    });
  };

  // Helper to determine if color is hex
  const isHexColor = (color) => /^#[0-9A-F]{6}$/i.test(color);

  const is_chat_with_seller_ok = () => {
    if (states_no_chat.includes(order.status[order.status.length - 1].update)) {
      return false;
    }
    if (order.status.some((s) => s.update === STATUS_CONFIRMED)) {
      return true;
    }

    return false;
  }

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
          {isLast && is_chat_with_seller_ok() && (
            <button className="chat-with-seller-btn" onClick={handleChat}>
              {chatRole === 'buyer' ? (t("chat_user")) : (t("chat_seller"))}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
