import React, { useState, useEffect } from 'react';
import './order_status_stepper.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const STATUS = {
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

const mapStatusToStepperState = (status, is_delivery) => {
    //console.log("mapStatusToStepperState status: ", status);
    if (!is_delivery) {
        if (status === STATUS.PENDING) return "pending";
        if (status === STATUS.CONFIRMED) return "confirmed";
        if (status === STATUS.READY_TO_PICKUP) return "ready_pickup";
        if (status === STATUS.PICKED_UP) return "picked_up";
        if (status === STATUS.CANCELLED_USER) return "cancelled_user";
        if (status === STATUS.CANCELLED_SELLER) return "cancelled_seller";
        if (status === STATUS.PICK_UP_FAILED) return "pick_up_failed";
    } else {
        // DELIVERY FLOW
        if (status === STATUS.PENDING) return "pending";
        if (status === STATUS.CONFIRMED) return "confirmed";
        if (status === STATUS.NO_RESPONSE) return "no_response";
        if (status === STATUS.FIRST_TRY_DELIVERY_FAILED) return "first_try_delivery_failed";
        if (status === STATUS.SECOND_TRY_DELIVERY) return "second_try_delivery";

        if (status === STATUS.FAILED_DELIVERY) return "failed_delivery";
        if (status === STATUS.SHIPPED) return "shipped";
        if (status === STATUS.DELIVERED) return "delivered";
        if (status === STATUS.CANCELLED_USER) return "cancelled_user";
        if (status === STATUS.CANCELLED_SELLER) return "cancelled_seller";
        if (status === STATUS.RETURN_REQUESTED) return "return_requested";
        if (status === STATUS.RETURN_CONFIRMED) return "return_confirmed";
        if (status === STATUS.RETURN_REFUSED) return "return_refused";
        if (status === STATUS.RETURN_SHIPPED) return "return_shipped";
        if (status === STATUS.RETURN_RECEIVED) return "return_received";
        if (status === STATUS.RETURN_NOT_RECEIVED) return "return_not_received";
        if ([STATUS.CANCELLED_USER, STATUS.CANCELLED_SELLER].includes(status)) return "cancelled";
    }

    return "unknown";
};

const getStepsFromLog = (t, statusLog, is_delivery) => {
    const steps = [];
    const lastLog = statusLog[statusLog.length - 1];
    // Pickup Flow
    if (!is_delivery) {
        let pickupSteps = [];
        if (lastLog.update == STATUS.PENDING) {
            pickupSteps.push("pending");
            pickupSteps.push("confirmed");
            pickupSteps.push("ready_pickup");
        }
        else if (lastLog.update == STATUS.CONFIRMED || lastLog.update == STATUS.READY_TO_PICKUP || lastLog.update == STATUS.PICKED_UP) {
            console.log("*** Push Confirmed");
            console.log("*** Push Ready Pickup");
            console.log("*** Push Picked Up");
            pickupSteps.push("pending");
            pickupSteps.push("confirmed");
            pickupSteps.push("ready_pickup");
            pickupSteps.push("picked_up");
        } else if (lastLog.update == STATUS.PICK_UP_FAILED) {
            pickupSteps.push("pending");
            pickupSteps.push("confirmed");
            pickupSteps.push("ready_pickup");
            pickupSteps.push("pick_up_failed");
        } else if (lastLog.update == STATUS.CANCELLED_SELLER) {
            pickupSteps.push("pending");
            if (statusLog.some((s) => s.update === STATUS.CONFIRMED)) {
                pickupSteps.push("confirmed");
            }
            if (statusLog.some((s) => s.update === STATUS.READY_TO_PICKUP)) {
                pickupSteps.push("ready_pickup");
            }
            if (statusLog.some((s) => s.update === STATUS.PICKED_UP)) {
                pickupSteps.push("picked_up");
            }
            pickupSteps.push("cancelled_seller");
        } else if (lastLog.update == STATUS.CANCELLED_USER) {
            pickupSteps.push("pending");
            if (statusLog.some((s) => s.update === STATUS.CONFIRMED)) {
                pickupSteps.push("confirmed");
            }
            if (statusLog.some((s) => s.update === STATUS.READY_TO_PICKUP)) {
                pickupSteps.push("ready_pickup");
            }
            if (statusLog.some((s) => s.update === STATUS.PICKED_UP)) {
                pickupSteps.push("picked_up");
            }
            pickupSteps.push("cancelled_user");
        }
        pickupSteps.forEach((key) => {
            const log = statusLog.find((s) => mapStatusToStepperState(s.update, false) === key);
            console.log("key: ", key, " log date: ", log?.date);
            steps.push({
                key,
                label: t(`order_state.${key}`),
                date: log?.date,
            });
        });
        return steps; // Return pickup steps if not delivery
    } else {
        console.log("lastLog: ", lastLog);
        if (lastLog) {
            let deliverySteps = [];
            console.log("lastLog.update: ", lastLog.update);
            if (lastLog.update >= STATUS.PENDING && lastLog.update <= STATUS.DELIVERED) {     // Delivery Flow Normal
                deliverySteps = ["pending", "confirmed", "shipped"];
                if (statusLog.some((s) => s.update === STATUS.FIRST_TRY_DELIVERY_FAILED)) {
                    deliverySteps.push("first_try_delivery_failed");
                }
                if (statusLog.some((s) => s.update === STATUS.SECOND_TRY_DELIVERY)) {
                    deliverySteps.push("second_try_delivery");
                }
                deliverySteps.push("delivered");
            }
            if (lastLog.update === STATUS.NO_RESPONSE) {     // Delivery Flow No Response
                deliverySteps = ["pending", "no_response"];
            }
            if (lastLog.update === STATUS.FIRST_TRY_DELIVERY_FAILED) {     // Delivery Flow First Try Failed Delivery
                deliverySteps = ["pending", "confirmed", "shipped", "first_try_delivery_failed", "second_try_delivery"];
            }
            if (lastLog.update === STATUS.SECOND_TRY_DELIVERY) {     // Delivery Flow Second Try Delivery
                deliverySteps = ["pending", "confirmed", "shipped", "first_try_delivery_failed", "second_try_delivery", "delivered"];
            }

            if (lastLog.update === STATUS.FAILED_DELIVERY) {
                //check if statusLog contain FIRST_TRY_DELIVERY_FAILED then push "first_try_delivery_failed" to deliverySteps
                deliverySteps = ["pending", "confirmed", "shipped"];
                if (statusLog.some((s) => s.update === STATUS.FIRST_TRY_DELIVERY_FAILED)) {
                    deliverySteps.push("second_try_delivery");
                }
                if (statusLog.some((s) => s.update === STATUS.SECOND_TRY_DELIVERY)) {
                    deliverySteps.push("second_try_delivery");
                }

                deliverySteps.push("failed_delivery");
            }

            if ([STATUS.RETURN_REQUESTED, STATUS.RETURN_CONFIRMED, STATUS.RETURN_REFUSED, STATUS.RETURN_SHIPPED, STATUS.RETURN_RECEIVED, STATUS.RETURN_NOT_RECEIVED].includes(lastLog.update)) {
                deliverySteps = ["pending", "confirmed", "shipped", "delivered"];
                deliverySteps.push("return_requested");
                if (statusLog.some(s => s.update === STATUS.RETURN_CONFIRMED)) deliverySteps.push("return_confirmed");
                if (statusLog.some(s => s.update === STATUS.RETURN_REFUSED)) deliverySteps.push("return_refused");
                if (statusLog.some(s => s.update === STATUS.RETURN_SHIPPED)) deliverySteps.push("return_shipped");
                if (statusLog.some(s => s.update === STATUS.RETURN_RECEIVED)) deliverySteps.push("return_received");
                if (statusLog.some(s => s.update === STATUS.RETURN_NOT_RECEIVED)) deliverySteps.push("return_not_received");
            }
            if (lastLog.update === STATUS.CANCELLED_USER || lastLog.update === STATUS.CANCELLED_SELLER) {
                deliverySteps = ["pending"];
                if (statusLog.some((s) => s.update === STATUS.CONFIRMED)) {
                    deliverySteps.push("confirmed");
                }
                if (statusLog.some((s) => s.update === STATUS.SHIPPED)) {
                    deliverySteps.push("shipped");
                }
                if (statusLog.some((s) => s.update === STATUS.FIRST_TRY_DELIVERY_FAILED)) {
                    deliverySteps.push("first_try_delivery_failed");
                }
                if (statusLog.some((s) => s.update === STATUS.SECOND_TRY_DELIVERY)) {
                    deliverySteps.push("second_try_delivery");
                }

                if (statusLog.some((s) => s.update === STATUS.READY_TO_PICKUP)) {
                    deliverySteps.push("ready_to_pickup");
                }
                if (statusLog.some((s) => s.update === STATUS.CANCELLED_USER)) {
                    deliverySteps.push("cancelled_user");
                }
                if (statusLog.some((s) => s.update === STATUS.CANCELLED_SELLER)) {
                    deliverySteps.push("cancelled_seller");
                }
            }
            deliverySteps.forEach((key) => {
                const log = statusLog.find((s) => {
                    return mapStatusToStepperState(s.update, true) === key;
                });

                steps.push({
                    key,
                    label: t(`order_state.${key}`),
                    date: log?.date,
                });
            });
        }

        return steps;
    }
};

const OrderStatusStepper = ({ order, t }) => {
    const isRTL = document.documentElement.dir === "rtl";

    const status = order.status;
    const is_delivery = order.is_delivery;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const steps = getStepsFromLog(t, status, is_delivery);
    const lastLog = status[status.length - 1];
    const currentKey = lastLog ? mapStatusToStepperState(lastLog.update, is_delivery) : "pending";
    const currentIndex = steps.findIndex((s) => s.key === currentKey);

    const displaySteps = (isMobile && !isExpanded)
        ? steps.filter((_, index) => index === currentIndex)
        : steps;

    return (
        <div className="order-stepper-wrapper">
            {isMobile && steps.length > 1 && (
                <button
                    className="stepper-toggle-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? "Collapse status history" : "Expand status history"}
                >
                    <span>{isExpanded ? t("hide_history") || "Hide History" : t("show_history") || "Show History"}</span>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            )}
            <div className={`order-stepper ${isMobile && !isExpanded ? 'stepper-collapsed' : ''} ${isRTL ? 'rtl' : ''}`}>
                {
                    displaySteps.map((step, index) => {
                        const actualIndex = steps.findIndex(s => s.key === step.key);
                        const isCompleted = step.date !== undefined && actualIndex <= currentIndex;
                        const isCurrent = actualIndex === currentIndex;

                        return (
                            <div key={step.key} className={`stepper-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
                                <div className="step-counter">{isCompleted ? "✓" : actualIndex + 1}</div>
                                <div className="step-name">{t(step.label)}</div>
                                {step.date && <div className="step-date">{new Date(step.date).toLocaleString()}</div>}
                                {index < displaySteps.length - 1 && <div className="step-line"></div>}
                            </div>
                        );
                    })
                }
            </div>
        </div >
    );
};

export default OrderStatusStepper;
