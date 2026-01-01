import React from "react";
import OrderItem from "./order_item";
import "./order_card.css";
import OrderStatusStepper from "./order_status_stepper";
import { useTranslation } from "react-i18next";
import { ORDER_STATUS } from "../utils/const/order_status";
import { FaTimes, FaStar } from "react-icons/fa";
import OrderRatingModal from "./OrderRatingModal";
import { toast } from "react-toastify";

export default function OrderCard({ order, products, t, onStatusChange, onRatingComplete }) {
  const { i18n } = useTranslation();
  const [showRatingModal, setShowRatingModal] = React.useState(false);
  const userId = localStorage.getItem("userId");
  const [hasRated, setHasRated] = React.useState(order.isRated || false);
  const productArray = Array.isArray(products) ? products : Object.values(products);

  React.useEffect(() => {
    if (order.isRated) {
      setHasRated(true);
    }
  }, [order.isRated]);

  // Get the latest status update
  const currentStatus = order.status && order.status.length > 0
    ? order.status[order.status.length - 1].update
    : 'pending';

  const isEligibleForRating = () => {
    if (hasRated || !order.status || order.status.length === 0 || !userId) return false;

    // Normalize products to a map for easy lookup
    const pMap = Array.isArray(products) ?
      products.reduce((acc, p) => ({ ...acc, [p._id]: p }), {}) : (products || {});

    // Check if we have all products for this order to avoid "flash" effect
    const hasAllProducts = order.items.every(item => pMap[item.productId]);
    if (!hasAllProducts) return false;

    // Check if any product in this order already has a review from this user
    const hasAlreadyReviewed = order.items.some(item => {
      const product = pMap[item.productId];
      if (product && Array.isArray(product.reviews)) {
        return product.reviews.some(r => {
          const reviewerId = r.user?._id || r.user;
          return reviewerId && String(reviewerId) === String(userId);
        });
      }
      return false;
    });

    if (hasAlreadyReviewed) return false;

    const lastUpdate = order.status[order.status.length - 1];
    if (!lastUpdate) return false;

    const s = Number(lastUpdate.update);

    // DELIVERED (3 or 6), PICKED_UP (41 or 3), RETURN_RECEIVED (24)
    const deliveryOk = (s === Number(ORDER_STATUS.DELIVERED)) || (s === 6) || (s === 3);
    const pickupOk = (s === Number(ORDER_STATUS.PICKED_UP)) || (s === 41);
    const returnOk = (s === Number(ORDER_STATUS.RETURN_RECEIVED)) || (s === 24);

    return deliveryOk || pickupOk || returnOk;
  };

  const renderActionButtons = () => {
    const buttons = [];
    if (currentStatus === ORDER_STATUS.PENDING) {
      buttons.push(
        <button key="cancel" className="seller-btn btn-cancel" onClick={() => onStatusChange(order._id, ORDER_STATUS.CANCELLED_USER)}>
          <FaTimes /> {t("order_state_buttons.cancel")}
        </button>
      );
    }

    if (isEligibleForRating()) {
      buttons.push(
        <button key="rate" className="seller-btn btn-rate" onClick={() => setShowRatingModal(true)}>
          <FaStar /> {t("order_state_buttons.rate") || "Rate"}
        </button>
      );
    }

    // Return Logic: Within 24 hours of DELIVERED
    const isWithin24Hours = (dateString) => {
      if (!dateString) return false;
      const date = new Date(dateString);
      const now = new Date();
      return (now - date) < 24 * 60 * 60 * 1000;
    };

    const deliveryStatus = order.status?.find(s => s.update === ORDER_STATUS.DELIVERED);

    if (currentStatus === ORDER_STATUS.DELIVERED && isWithin24Hours(deliveryStatus?.date)) {
      buttons.push(
        <button key="return_req" className="seller-btn btn-return" onClick={() => onStatusChange(order._id, ORDER_STATUS.RETURN_REQUESTED)}>
          {t("order_state_buttons.request_return") || "Request Return"}
        </button>
      );
    }

    if (currentStatus === ORDER_STATUS.RETURN_CONFIRMED) {
      buttons.push(
        <button key="return_ship" className="seller-btn btn-return" onClick={() => onStatusChange(order._id, ORDER_STATUS.RETURN_SHIPPED)}>
          {t("order_state_buttons.return_shipped") || "Return Shipped"}
        </button>
      );
    }

    return <div className="seller-actions-row">{buttons}</div>;
  }

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
    : '';

  return (
    <div className="user-order-card">
      <div className="order-card-header">
        <div className={`order-header-left ${i18n.language === "ar" ? "rtl-fix" : ""}`}>
          <span className="order-id-label">{t("order_id")}</span>
          <span className="order-id-value">{order.orderNumber}</span>
          {formattedDate && <span className="order-date">• {formattedDate}</span>}
        </div>
        <div className={`order-header-right ${i18n.language === "ar" ? "rtl-fix" : ""}`}>
          <span className="order-total-label">{t("cart_page.total")}:</span>
          <span className="order-total-value">€{order.totalPrice.toFixed(3)}</span>
        </div>
      </div>

      <div className="order-items-container">
        {order.items.map((item, index) => {
          const product = productArray.find(p => p._id === item.productId);
          return (
            <OrderItem
              key={item._id}
              item={item}
              product={product}
              order={order}
              t={t}
              isLast={index === order.items.length - 1}
            />
          );
        })}
      </div>

      <div className="order-card-footer">
        <OrderStatusStepper order={order} t={t} />
        {renderActionButtons()}
      </div>

      {showRatingModal && (
        <OrderRatingModal
          order={order}
          products={products}
          onClose={() => setShowRatingModal(false)}
          onRatingComplete={() => {
            setHasRated(true);
            setShowRatingModal(false);
            if (onRatingComplete) onRatingComplete();
            toast.success(t("thank_you_for_rating") || "Thank you for your rating!");
          }}
        />
      )}
    </div>
  );
}
