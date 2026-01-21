import React, { useState, useEffect } from 'react';
import './order_status_stepper.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Constants for all possible order states
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

/**
 * Maps a numeric status code to a human-readable string key used for translations.
 * Distinguishes between Delivery and Pickup flows.
 */
const mapStatusToStepperState = (status, is_delivery) => {
    const s = Number(status); // Ensure we compare numbers
    if (!is_delivery) {
        // PICKUP FLOW
        if (s === STATUS.PENDING) return "pending";
        if (s === STATUS.CONFIRMED) return "confirmed";
        if (s === STATUS.READY_TO_PICKUP) return "ready_pickup";
        if (s === STATUS.PICKED_UP) return "picked_up";
        if (s === STATUS.CANCELLED_USER) return "cancelled_user";
        if (s === STATUS.CANCELLED_SELLER) return "cancelled_seller";
        if (s === STATUS.PICK_UP_FAILED) return "pick_up_failed";
    } else {
        // DELIVERY FLOW
        if (s === STATUS.PENDING) return "pending";
        if (s === STATUS.CONFIRMED) return "confirmed";
        if (s === STATUS.NO_RESPONSE) return "no_response";
        if (s === STATUS.FIRST_TRY_DELIVERY_FAILED) return "first_try_delivery_failed";
        if (s === STATUS.SECOND_TRY_DELIVERY) return "second_try_delivery";
        if (s === STATUS.FAILED_DELIVERY) return "failed_delivery";
        if (s === STATUS.SHIPPED) return "shipped";
        if (s === STATUS.DELIVERED) return "delivered";
        if (s === STATUS.RETURN_REQUESTED) return "return_requested";
        if (s === STATUS.RETURN_CONFIRMED) return "return_confirmed";
        if (s === STATUS.RETURN_REFUSED) return "return_refused";
        if (s === STATUS.RETURN_SHIPPED) return "return_shipped";
        if (s === STATUS.RETURN_RECEIVED) return "return_received";
        if (s === STATUS.RETURN_NOT_RECEIVED) return "return_not_received";
        if (s === STATUS.CANCELLED_USER) return "cancelled_user";
        if (s === STATUS.CANCELLED_SELLER) return "cancelled_seller";
    }
    return "unknown";
};

/**
 * Generates an array of step objects to display in the UI based on the order's history log.
 */
const getStepsFromLog = (t, statusLog, is_delivery) => {
    const steps = [];
    const lastLog = statusLog[statusLog.length - 1];
    if (!lastLog) return steps;

    const getStatus = (log) => log.status !== undefined ? Number(log.status) : Number(log.update);
    const getDate = (log) => log.createdAt || log.date;
    const lastStatus = getStatus(lastLog);

    if (!is_delivery) {
        // --- LOGIC FOR PICKUP (Bleibt unverändert) ---
        let pickupSteps = [];
        if (lastStatus === STATUS.PENDING) {
            pickupSteps.push("pending", "confirmed", "ready_pickup");
        } else if ([STATUS.CONFIRMED, STATUS.READY_TO_PICKUP, STATUS.PICKED_UP].includes(lastStatus)) {
            pickupSteps.push("pending", "confirmed", "ready_pickup", "picked_up");
        } else if (lastStatus === STATUS.PICK_UP_FAILED) {
            pickupSteps.push("pending", "confirmed", "ready_pickup", "pick_up_failed");
        } else if (lastStatus === STATUS.CANCELLED_SELLER || lastStatus === STATUS.CANCELLED_USER) {
            pickupSteps.push("pending");
            if (statusLog.some(s => getStatus(s) === STATUS.CONFIRMED)) pickupSteps.push("confirmed");
            if (statusLog.some(s => getStatus(s) === STATUS.READY_TO_PICKUP)) pickupSteps.push("ready_pickup");
            pickupSteps.push(lastStatus === STATUS.CANCELLED_SELLER ? "cancelled_seller" : "cancelled_user");
        }

        pickupSteps.forEach((key) => {
            const log = statusLog.find(s => mapStatusToStepperState(getStatus(s), false) === key);
            steps.push({
                key,
                label: t(`order_state.${key}`),
                date: log ? getDate(log) : undefined,
            });
        });
        return steps;
    } else {
        // --- VEREINFACHTE LOGIK FÜR DELIVERY ---
        let deliverySteps = [];

        // Prüfen: Ist die Bestellung auf dem Erfolgsweg?
        const isNormalPath = [STATUS.PENDING, STATUS.CONFIRMED, STATUS.SHIPPED, STATUS.DELIVERED].includes(lastStatus);

        // Prüfen: Ist die Zustellung (egal in welchem Versuch) gescheitert?
        const isDeliveryFailed = [STATUS.FIRST_TRY_DELIVERY_FAILED, STATUS.SECOND_TRY_DELIVERY, STATUS.FAILED_DELIVERY].includes(lastStatus);

        if (isNormalPath) {
            // Zeigt: Ausstehend -> Bestätigt -> Versendet -> Geliefert (Grau wenn noch nicht erreicht)
            deliverySteps = ["pending", "confirmed", "shipped", "delivered"];
        }
        else if (isDeliveryFailed) {
            // Zeigt: Ausstehend -> Bestätigt -> Versendet -> Zustellung fehlgeschlagen
            deliverySteps = ["pending", "confirmed", "shipped", "failed_delivery"];
        }
        else if (lastStatus === STATUS.NO_RESPONSE) {
            deliverySteps = ["pending", "no_response"];
        }
        else if ([STATUS.RETURN_REQUESTED, STATUS.RETURN_CONFIRMED, STATUS.RETURN_REFUSED, STATUS.RETURN_SHIPPED, STATUS.RETURN_RECEIVED, STATUS.RETURN_NOT_RECEIVED].includes(lastStatus)) {
            deliverySteps = ["pending", "confirmed", "shipped", "delivered", "return_requested"];
            const returnStates = ["return_confirmed", "return_refused", "return_shipped", "return_received", "return_not_received"];
            returnStates.forEach(rs => {
                if (statusLog.some(s => mapStatusToStepperState(getStatus(s), true) === rs)) deliverySteps.push(rs);
            });
        }
        else if (lastStatus === STATUS.CANCELLED_USER || lastStatus === STATUS.CANCELLED_SELLER) {
            deliverySteps = ["pending"];
            const check = (st) => statusLog.some(s => getStatus(s) === st);
            if (check(STATUS.CONFIRMED)) deliverySteps.push("confirmed");
            if (check(STATUS.SHIPPED)) deliverySteps.push("shipped");
            deliverySteps.push(lastStatus === STATUS.CANCELLED_USER ? "cancelled_user" : "cancelled_seller");
        }

        deliverySteps.forEach((key) => {
            // Spezial-Logik für failed_delivery: Suche Datum von Status 11, 12 oder 13
            const log = statusLog.find(s => {
                const sKey = mapStatusToStepperState(getStatus(s), true);
                if (key === "failed_delivery") {
                    return ["failed_delivery", "first_try_delivery_failed", "second_try_delivery"].includes(sKey);
                }
                return sKey === key;
            });

            steps.push({
                key,
                label: t(`order_state.${key}`),
                date: log ? getDate(log) : undefined,
            });
        });
        return steps;
    }
};

const OrderStatusStepper = ({ order, t }) => {
    const isRTL = document.documentElement.dir === "rtl";
    const sortedHistory = [...(order.statusHistory || [])].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    const is_delivery = order.is_delivery;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    // Responsive check for mobile view
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const steps = getStepsFromLog(t, sortedHistory, is_delivery);
    // Determine the current step index to highlight correctly
    const lastStatus = order.currentStatus;
    const currentKey = mapStatusToStepperState(lastStatus, is_delivery);
    const currentIndex = steps.findIndex((s) => s.key === currentKey);

    // On mobile, show only the current step unless expanded
    const displaySteps = (isMobile && !isExpanded)
        ? steps.filter((_, index) => index === currentIndex)
        : steps;

    const FAILED_STATUSES = [
        STATUS.CANCELLED_USER,
        STATUS.CANCELLED_SELLER,
        STATUS.PICK_UP_FAILED,
        STATUS.FAILED_DELIVERY,
        STATUS.RETURN_NOT_RECEIVED
    ];

    const isFailed = FAILED_STATUSES.includes(Number(lastStatus));

    return (
        <div className="order-stepper-wrapper">
            {/* Mobile Toggle Button */}
            {isMobile && steps.length > 1 && (
                <button
                    className="stepper-toggle-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span>{isExpanded ? t("hide_history") : t("show_history")}</span>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            )}

            <div className={`order-stepper ${isMobile && !isExpanded ? 'stepper-collapsed' : ''} ${isRTL ? 'rtl' : ''}`}>
                {displaySteps.map((step, index) => {
                    // Find actual index in full array for numbering and logic
                    const actualIndex = steps.findIndex(s => s.key === step.key);

                    // Only successful final statuses should be visually "Completed" (Checkmark)
                    const SUCCESS_STATUSES = [
                        STATUS.DELIVERED,
                        STATUS.PICKED_UP,
                        STATUS.RETURN_RECEIVED
                    ];

                    const isSuccessFinal = SUCCESS_STATUSES.includes(Number(lastStatus));
                    const isCompleted = actualIndex < currentIndex || (actualIndex === currentIndex && isSuccessFinal);
                    const isCurrent = actualIndex === currentIndex;
                    const itemClass = `stepper-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isCurrent && isFailed ? "failed" : ""}`;
                    return (
                        <div key={step.key} className={itemClass}>
                            <div className="step-counter">
                                {isCompleted ? "✓" : (isCurrent && isFailed ? "✕" : actualIndex + 1)}
                            </div>
                            <div className="step-content">
                                <div className="step-name">{t(step.label)}</div>
                                {step.date && (
                                    <div className="step-date">
                                        {new Date(step.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                )}
                            </div>
                            {index < displaySteps.length - 1 && <div className="step-line"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderStatusStepper;