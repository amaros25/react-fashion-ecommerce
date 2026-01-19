import React from "react";
import OrderStatusStepper from "./order_status_stepper.js";
import "./css/main_order_card_footer.css";

const MainOrderCardFooter = ({ order, t, viewMode, renderUserButtons, renderSellerButtons, renderChatButton }) => {
    return (
        <div className="mocf-container">
            <OrderStatusStepper order={order} t={t} />
            <div className="mocf-footer-bottom">
                <div className="mocf-chat-section">
                    {renderChatButton && renderChatButton()}
                </div>
                <div className="mocf-actions-group">
                    {viewMode === "user" ? renderUserButtons() : renderSellerButtons()}
                </div>
            </div>
        </div>
    );
};

export default MainOrderCardFooter;