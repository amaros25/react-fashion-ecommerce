import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./order_items.css";
import { ORDER_STATUS } from "../utils/const/order_status";
import { FaStar, FaRegCommentDots } from "react-icons/fa";

export default function OrderItem({ item, product, order, t, showRatingButton, isLast, chatRole = 'seller', viewMode = 'user', onRateClick }) {
  const navigate = useNavigate();
  const userReview = item.product?.reviews?.[0];
  const isRated = !!userReview;
  const ratingValue = userReview?.rating;

  const isEligibleStatus = [
    Number(ORDER_STATUS.DELIVERED),
    Number(ORDER_STATUS.PICKED_UP)
  ].includes(Number(order.currentStatus));


  /**
   * HANDLER: Navigation to Chat
   * Determines if the user is a buyer or seller to set the correct partnerId.
   */
  const handleChat = (e) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Prevent bubbling to the card container

    // If chatRole is 'buyer', it means the viewer is the SELLER (wants to chat with buyer)
    // If chatRole is 'seller', it means the viewer is the BUYER (wants to chat with seller)
    const isSellerViewing = chatRole === 'buyer';
    const targetId = isSellerViewing ? order.userId : order.sellerId;
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

  /**
   * Helper: Check if a string is a Hex Color (e.g., #FFFFFF)
   */
  const isHexColor = (color) => /^#[0-9A-F]{6}$/i.test(color);



  const renderUserRating = () => {
    // Nur für User anzeigen und nur wenn bereits bewertet wurde
    if (viewMode !== "user" || !isRated) return null;

    return (
      <div className="product-rating-minimal-badge">
        <div className="star-display-small">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={star <= ratingValue ? "star-active" : "star-empty"}
            />
          ))}
        </div>
        <span className="rating-label-fine">
          {t("your_product_rating")}
        </span>
      </div>
    );
  };

  return (
    <Link to={`/product/${item.productId}`} className="order-item-link">
      <div className="order-item-card">

        {/* Left Side: Image and Basic Info */}
        <div className="order-item-left">
          <div className="order-item-image-container">
            {/* ÄNDERUNG: product?.images (mit s) anstatt product?.image */}
            {item.product?.images?.[0] ? (
              <img
                src={item.product?.images?.[0]}
                alt={item.product?.name}
                className="order-product-image"
              />
            ) : (
              <div className="order-product-placeholder"></div>
            )}


          </div>

          <div className="order-product-info">
            <p className="order-product-title">
              {item.product?.name || t("loading_product")}
            </p>

            {/* Product Variants (Size, Color, Quantity) */}
            <div className="order-product-variants">
              <div className="variant-item">
                <span className="variant-label">{t("size")}:</span>
                <span className="variant-value">{item.variant.size}</span>
              </div>

              <div className="variant-item">
                <span className="variant-label">{t("color")}:</span>
                {isHexColor(item.variant.color) ? (
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: item.variant.color }}
                    title={item.variant.color}
                  ></span>
                ) : (
                  <span className="variant-value">
                    {/* Nutze Optional Chaining ?. und prüfe auf Existenz von color */}
                    {item?.variant.color
                      ? t(`product_colors.${item.variant.color.toLowerCase()}`, { defaultValue: item.variant.color })
                      : t("no_color_specified") // Fallback-Text
                    }
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

        {/* Right Side: Chat Button (Only shown on the last item to avoid duplicates) */}
        <div className="order-item-right">


          <div className="item-rating-actions">
            {/* 2. Wenn bereits bewertet wurde: IMMER Sterne zeigen (egal ob showRatingButton true/false) */}
            {viewMode === "user" && isRated && (
              renderUserRating()
            )}

            {/* 3. Wenn NOCH NICHT bewertet wurde: Button zeigen (nur beim ersten Mal) */}
            {viewMode === "user" && !isRated && showRatingButton && isEligibleStatus && (
              <button className="seller-btn btn-rate" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Hier Funktion zum Modal öffnen aufrufen, falls nötig
                onRateClick();
              }}>
                <FaStar /> {t("order_state_buttons.rate")}
              </button>
            )}
            {/* 1. Chat Button bleibt gleich */}

          </div>

        </div>
      </div>
    </Link >
  );
}