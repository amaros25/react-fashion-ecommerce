import React from "react";
import OrderItem from "./order_item";
import "./order_card.css";
import OrderStatusStepper from "./order_status_stepper";
import { useTranslation } from "react-i18next";
import { ORDER_STATUS } from "../utils/const/order_status";
import { FaTimes } from "react-icons/fa";

export default function OrderCard({ order, products, t, onStatusChange }) {
  const { i18n } = useTranslation();
  const productArray = Array.isArray(products) ? products : Object.values(products);

  // Get the latest status update
  const currentStatus = order.status && order.status.length > 0
    ? order.status[order.status.length - 1].update
    : 'pending';

  const renderActionButtons = () => {
    const buttons = [];
    if (currentStatus === ORDER_STATUS.PENDING) {

      buttons.push(
        <button key="cancel" className="seller-btn btn-cancel" onClick={() => onStatusChange(order._id, ORDER_STATUS.CANCELLED_USER)}>
          <FaTimes /> {t("order_state_buttons.cancel")}
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
    </div>
  );
}
