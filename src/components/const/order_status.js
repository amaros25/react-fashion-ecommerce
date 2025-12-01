export const ORDER_STATUS = {
    PENDING: 0,
    CONFIRMED: 1,
    READY_TO_PICKUP: 2,
    PICKED_UP: 3,
    CANCELLED: 4,
    SHIPPED: 5,
    DELIVERED: 6
};

export const ORDER_STATUS_LABELS = {
    0: "Pending",
    1: "Confirmed",
    2: "Ready to Pickup",
    3: "Picked Up",
    4: "Cancelled",
    5: "Shipped",
    6: "Delivered"
};

export const getStatusLabel = (statusInt) => {
    return ORDER_STATUS_LABELS[statusInt] || "Unknown";
};
