export const ORDER_STATUS = {
    PENDING: 0,
    CONFIRMED: 1,
    SHIPPED: 2,
    DELIVERED: 3,

    NO_RESPONSE: 10,


    FIRST_TRY_DELIVERY_FAILED: 11,
    SECOND_TRY_DELIVERY: 12,
    FAILED_DELIVERY: 13,

    RETURN_REQUESTED: 20,
    RETURN_CONFIRMED: 21,
    RETURN_REFUSED: 22,
    RETURN_SHIPPED: 23,
    RETURN_RECEIVED: 24,
    RETURN_NOT_RECEIVED: 25,

    CANCELLED_USER: 30,
    CANCELLED_SELLER: 31,

    READY_TO_PICKUP: 40,
    PICKED_UP: 41,
    PICK_UP_FAILED: 42,
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
