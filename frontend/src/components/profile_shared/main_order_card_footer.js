import React, { useState } from "react"; // useState hinzugefügt
import OrderStatusStepper from "./order_status_stepper.js";
import { FaChevronDown, FaInfoCircle } from "react-icons/fa"; // Icons für das Dropdown
import "./css/main_order_card_footer.css";
import "./css/card_buttons.css";

const MainOrderCardFooter = ({ order, t, viewMode, renderUserButtons, renderSellerButtons }) => {
    console.log("MainOrderCardFooter order:", order);
    const [showComment, setShowComment] = useState(false);

    // Den letzten Kommentar aus der History finden (der nicht leer ist)
    const lastStatusWithComment = order.statusHistory?.slice().reverse().find(h => h.comment && h.comment.trim() !== "");
    const hasComment = !!lastStatusWithComment;
    return (
        <div className="mocf-container">
            <OrderStatusStepper order={order} t={t} />

            {/* Kommentar Sektion im Zara-Stil */}
            {hasComment && (
                <div className="mocf-zara-wrapper">
                    <button
                        className="mocf-zara-trigger"
                        onClick={() => setShowComment(!showComment)}
                    >
                        <FaInfoCircle className="mocf-zara-icon" />
                        <span className="mocf-zara-text">{t("view_reason")}</span>
                        <FaChevronDown className={`mocf-zara-arrow ${showComment ? 'open' : ''}`} />
                    </button>

                    {showComment && (
                        <div className="mocf-zara-content" dir="auto">
                            <p className="mocf-zara-comment">{lastStatusWithComment.comment}</p>
                            <span className="mocf-zara-date">
                                {new Date(lastStatusWithComment.createdAt).toLocaleString([], {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div className="mocf-footer-bottom">
                <div className="mocf-actions-group">
                    {viewMode === "user" ? renderUserButtons() : renderSellerButtons()}
                </div>
            </div>
        </div>
    );
};

export default MainOrderCardFooter;