import React from "react";
import OrderItem from "./order_item";
import "./order_card.css";
import OrderStatusStepper from "./order_status_stepper";

export default function OrderCard({ order, products, t }) {
  const productArray = Array.isArray(products) ? products : Object.values(products);

  // Get the latest status update
  const currentStatus = order.status && order.status.length > 0
    ? order.status[order.status.length - 1].update
    : 'pending';

  const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';

  return (
    <div className="user-order-card">
      <div className="order-card-header">
        <div className="order-header-left">
          <span className="order-id-label">{t("order_id") || "Order ID"}</span>
          <span className="order-id-value">{order.orderNumber}</span>
          {formattedDate && <span className="order-date">• {formattedDate}</span>}
        </div>
        <div className="order-header-right">
          <span className="order-total-label">{t("total") || "Total"}:</span>
          <span className="order-total-value">€{order.totalPrice.toFixed(2)}</span>
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
      </div>
    </div>
  );
}
