import React from 'react';
import './order_status_stepper.css';

const STATUS = {
    PENDING: 0,
    CONFIRMED: 1,
    SHIPPED: 2,
    DELIVERED: 3,
    RECEIVED_USER: 4,

    NO_RESPONSE: 10,
    FIRST_TRY_DELIVERY: 11,
    SECOND_TRY_DELIVERY: 12,
    THIRD_TRY_DELIVERY: 13,
    FAILED_DELIVERY: 14,

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

const mapStatusToStepperState = (status, is_delivery) => {
    if (!is_delivery) {
        if (status === STATUS.PENDING) return "pending";
        if (status === STATUS.CONFIRMED) return "confirmed";
        if (status === STATUS.READY_TO_PICKUP) return "ready_pickup";
        if (status === STATUS.PICKED_UP) return "picked_up";
        if (status === STATUS.RECEIVED_USER) return "completed";
        if ([STATUS.RETURN_REQUESTED, STATUS.RETURN_CONFIRMED, STATUS.RETURN_SHIPPED, STATUS.RETURN_RECEIVED].includes(status)) return "return";
        if ([STATUS.CANCELLED_USER, STATUS.CANCELLED_SELLER, STATUS.PICK_UP_FAILED].includes(status)) return "cancelled";
        return "unknown";
    }

    // DELIVERY FLOW
    if (status === STATUS.PENDING) return "pending";
    if (status === STATUS.CONFIRMED) return "confirmed";
    if (status === STATUS.NO_RESPONSE) return "no_response";
    if (status === STATUS.FIRST_TRY_DELIVERY) return "first_try_delivery";
    if (status === STATUS.SECOND_TRY_DELIVERY) return "second_try_delivery";
    if (status === STATUS.THIRD_TRY_DELIVERY) return "third_try_delivery";
    if (status === STATUS.FAILED_DELIVERY) return "failed_delivery";
    if (status === STATUS.SHIPPED) return "shipped";
    if (status === STATUS.DELIVERED) return "delivered";
    if (status === STATUS.RECEIVED_USER) return "completed";
    if ([STATUS.RETURN_REQUESTED, STATUS.RETURN_CONFIRMED, STATUS.RETURN_SHIPPED, STATUS.RETURN_RECEIVED].includes(status)) return "return";
    if ([STATUS.CANCELLED_USER, STATUS.CANCELLED_SELLER].includes(status)) return "cancelled";

    return "unknown";
};


const getSteps = (t, currentStatus, is_delivery) => {
    if (!is_delivery) {
        // Pickup flow
        return [
            { key: "pending", label: t("order_state.pending") },
            { key: "confirmed", label: t("order_state.confirmed") },
            { key: "ready_pickup", label: t("order_state.ready_to_pickup") },
            { key: "picked_up", label: t("order_state.picked_up") },
            { key: "completed", label: t("order_state.received_user") },
        ];
    }

    // Delivery flow
    const deliveryAttempts = [
        { key: "first_try_delivery", label: t("order_state.first_try_delivery") },
        { key: "second_try_delivery", label: t("order_state.second_try_delivery") },
        { key: "third_try_delivery", label: t("order_state.third_try_delivery") },
    ];

    const steps = [
        { key: "pending", label: t("order_state.pending") },

    ];

    // Status 10 → No Response
    if (currentStatus === STATUS.NO_RESPONSE) {
        steps.push({ key: "no_response", label: t("order_state.no_response") });
        return steps;
    }
    steps.push({ key: "confirmed", label: t("order_state.confirmed") });
    // Status 11–13 → Delivery attempts
    if (
        currentStatus === STATUS.FIRST_TRY_DELIVERY ||
        currentStatus === STATUS.SECOND_TRY_DELIVERY ||
        currentStatus === STATUS.THIRD_TRY_DELIVERY
    ) {
        steps.push(...deliveryAttempts);

        steps.push({ key: "delivered", label: t("order_state.delivered") });
        steps.push({ key: "completed", label: t("order_state.received_user") });
        return steps;
    }

    // Status 14 → Failed Delivery
    if (currentStatus === STATUS.FAILED_DELIVERY) {
        steps.push(...deliveryAttempts);
        steps.push({ key: "failed_delivery", label: t("order_state.failed_delivery") });
        return steps;
    }

    // Normale Lieferung (0–4)
    steps.push(
        { key: "shipped", label: t("order_state.shipped") },
        { key: "delivered", label: t("order_state.delivered") },
        { key: "completed", label: t("order_state.received_user") }
    );

    // Status 20 → RETURN_REQUESTED
    if (currentStatus === STATUS.RETURN_REQUESTED) {
        steps.push({ key: "return_requested", label: t("order_state.return_requested") });
        return steps;
    }
    if (currentStatus === STATUS.RETURN_CONFIRMED) {
        steps.push({ key: "return_confirmed", label: t("order_state.return_confirmed") });
        return steps;
    }
    if (currentStatus === STATUS.RETURN_REFUSED) {
        steps.push({ key: "return_refused", label: t("order_state.return_refused") });
        return steps;
    }
    if (currentStatus === STATUS.RETURN_SHIPPED) {
        steps.push({ key: "return_shipped", label: t("order_state.return_shipped") });
        return steps;
    }
    if (currentStatus === STATUS.RETURN_RECEIVED) {
        steps.push({ key: "return_received", label: t("order_state.return_received") });
        return steps;
    }
    if (currentStatus === STATUS.RETURN_NOT_RECEIVED) {
        steps.push({ key: "return_not_received", label: t("order_state.return_not_received") });
        return steps;
    }
    return steps;
};

const OrderStatusStepper = ({ currentStatus, is_delivery, t }) => {
    const stepKey = mapStatusToStepperState(currentStatus, is_delivery);


    const steps = getSteps(t, currentStatus, is_delivery);
    const currentIndex = steps.findIndex(s => s.key === stepKey);

    return (
        <div className="order-stepper">
            {steps.map((step, index) => {
                const isCompleted = index <= currentIndex && currentIndex !== -1;
                const isCurrent = index === currentIndex;

                return (
                    <div key={step.key} className={`stepper-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
                        <div className="step-counter">
                            {isCompleted ? "✓" : index + 1}
                        </div>
                        <div className="step-name">{step.label}</div>
                        {index < steps.length - 1 && <div className="step-line"></div>}
                    </div>
                );
            })}
        </div>
    );
};

export default OrderStatusStepper;
