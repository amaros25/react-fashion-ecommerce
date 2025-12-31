import React from "react";
import OrderCard from "./order_card";
import Pagination from "../home/pagination";

export default function ProfileUserOrders({ orders, products, totalPages, currentPage, setCurrentPage, t, handleStatusChange, onRatingComplete }) {
  if (orders.length === 0) return (
    <div className="no-orders-placeholder">
      <p>{t("no_orders_yet")}</p>
    </div>
  );

  return (
    <>
      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} products={products} t={t} onStatusChange={handleStatusChange} onRatingComplete={onRatingComplete} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}
