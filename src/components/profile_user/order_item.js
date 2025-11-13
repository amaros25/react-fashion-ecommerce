import React from "react";
import { Link } from "react-router-dom";
import "./order_items.css";

export default function OrderItem({ item, product, order, t, isLast }) {
  return (
    <Link to={`/product/${item.productId}`} className="order-item-card clickable">
      <div className="order-item-left">
        {product?.image?.[0] && (
          <img src={product.image[0]} alt={product.name} className="order-product-image" />
        )}
        <div className="order-product-info">
          <p className="order-product-title">{product?.name || t("loading_product")}</p>
          <div className="order-product-variants">
            <span>{t("size")}: {item.size}</span>
            <span>{t("color")}: {t(`product_colors.${item.color.toLowerCase()}`, { defaultValue: item.color })}</span>
            <span>{t("quantity")}: {item.quantity}</span>
          </div>
        </div>
      </div>
      {isLast && (
        <div className="order-item-right">
          <p className="order-info">
            <strong>{t("price")}:</strong> €{order.totalPrice.toFixed(2)}
          </p>
          <p className="order-info">
            <strong>{t("status")}:</strong>
            {order.status && Array.isArray(order.status) && order.status.length > 0
              ? t(`order_state.${order.status.slice(-1)[0]?.update}`) || t("order_state.pending")
              : t("order_state.pending")}
          </p>
        </div>
      )}
    </Link>
  );
}
