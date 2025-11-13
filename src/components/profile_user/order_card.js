import React from "react";
import OrderItem from "./order_item";
import "./order_card.css";

export default function OrderCard({ order, products, t }) {
const productArray = Array.isArray(products) ? products : Object.values(products);
return (
    <div className="user-order-card">
      <div className="order-card-header">
        <span>{t("order_id")}:</span> <strong>{order.orderNumber}</strong>
      </div>
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
  );
}
