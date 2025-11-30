import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";



const StatusSelect = forwardRef(({ order, onStatusChange }, ref) => {
  const { t } = useTranslation();

  const getStatusOptions = (status) => {
    switch (status) {
      case "pending":
        return [
          { value: "confirmed", label: t("order_state.confirmed") },
          { value: "dont_respond", label: t("order_state.dont_respond") },
          { value: "seller_cancelled", label: t("order_state.seller_cancelled") },
        ];
      case "dont_respond":
        return [
          { value: "confirmed", label: t("order_state.confirmed") },
          { value: "seller_cancelled", label: t("order_state.seller_cancelled") },
        ];

      case "confirmed":
        return [
          { value: "seller_cancelled", label: t("order_state.seller_cancelled") },
          { value: "shipped", label: t("order_state.shipped") },

        ];
      case "shipped":
        return [
 
          { value: "failed_delivery", label: t("order_state.failed_delivery") },
        ];

// Failed delivery
      case "failed_delivery":
        return [
          { value: "second_try", label: t("order_state.second_try") },
          { value: "seller_cancelled", label: t("order_state.seller_cancelled") },
          { value: "delivered", label: t("order_state.delivered") },
        ];

      case "second_try":
        return [
          { value: "third_try", label: t("order_state.third_try") },
          { value: "seller_cancelled", label: t("order_state.seller_cancelled") },
            { value: "delivered", label: t("order_state.delivered") },
        ];
      case "third_try":
        return [
 
          { value: "seller_cancelled", label: t("order_state.seller_cancelled") },
          { value: "delivered", label: t("order_state.delivered") },
        ];

//User want to send back
      case "return_requested":
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

  const statusOptions = getStatusOptions(order.status?.slice(-1)[0]?.update || "pending");

  return (
    <select
      ref={ref}
      className="status-select"
      defaultValue={order.status?.slice(-1)[0]?.update || "pending"}
      onChange={(e) => onStatusChange(order._id, e.target.value)}
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

export default StatusSelect;
