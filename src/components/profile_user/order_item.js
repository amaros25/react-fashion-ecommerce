import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./order_items.css";
import { ORDER_STATUS } from "../utils/const/order_status";

export default function OrderItem({ item, product, order, t, isLast, chatRole = 'seller' }) {
  const navigate = useNavigate();

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
    if (!order.status || order.status.length === 0) return false;

    const lastStatus = order.status[order.status.length - 1].update;
    const allowedStatuses = [
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.FIRST_TRY_DELIVERY_FAILED,
      ORDER_STATUS.SECOND_TRY_DELIVERY,
      ORDER_STATUS.FAILED_DELIVERY,
      ORDER_STATUS.RETURN_REQUESTED,
      ORDER_STATUS.RETURN_CONFIRMED,
      ORDER_STATUS.RETURN_SHIPPED,
      ORDER_STATUS.READY_TO_PICKUP
    ];

    return allowedStatuses.includes(lastStatus);
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
