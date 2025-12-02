import React from "react";
import OrderCard from "./order_card";

export default function ProfileUserOrders({ orders, products, totalPages, currentPage, setCurrentPage, t }) {
  if (orders.length === 0) return (
    <div className="no-orders-placeholder">
      <p>{t("no_orders_yet")}</p>
    </div>
  );

  return (
    <>
      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} products={products} t={t} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
