import React from "react";
import { useTranslation } from "react-i18next";

const StatusSelect = ({ order, onStatusChange }) => {
  const { t } = useTranslation();




  // Definiere die Optionen basierend auf dem Status des Auftrags
  const getStatusOptions = (status) => {
    switch (status) {
      case "pending": //Done
        return [
          { value: "confirmed", label: t("order_state.confirmed") },
          { value: "seller_cancelled", label: t("order_state.seller_cancelled") },
        ];
      case "confirmed":
        return [
        { value: "shipped", label: t("order_state.shipped") },
        { value: "seller_cancelled", label: t("order_state.seller_cancelled") },
         ];
      case "shipped":
        return [
          { value: "delivered", label: t("order_state.delivered") },
          { value: "failed_delivery", label: t("order_state.failed_delivery") },
        ];
      case "delivered":
        return [
          { value: "return_confirmed", label: t("order_state.return_confirmed") },
          { value: "return_received", label: t("order_state.return_received") },
        ];
      case "return_confirmed":
      case "return_received":
        return [
          { value: "return_shipped", label: t("order_state.return_shipped") },
          { value: "failed_delivery", label: t("order_state.failed_delivery") },
        ];
      default:
        return [];
    }
  };

  // Die verfügbaren Statusoptionen für den aktuellen Status
  const statusOptions = getStatusOptions(order.status?.slice(-1)[0]?.update || "pending");

  return (
    <select
      className="status-select"
      value={order.status?.slice(-1)[0]?.update || "pending"}
      onChange={(e) => onStatusChange(order._id, e.target.value)}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default StatusSelect;