
import React, { useState, useEffect } from "react";
import "./order_comment_popup.css";


const OrderCommentPopup = ({ isOpen, onClose, onConfirm, statusLabel, t }) => {
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!isOpen) setComment("");
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="status-modal-overlay">
            <div className="status-modal-content">
                <h3>{t("order_state_update")}: {statusLabel}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{t("please_provide_reason")}</p>
                <textarea
                    className="status-comment-textarea"
                    placeholder={t("write_comment_placeholder")}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className="status-modal-actions">
                    <button className="btn-modal-secondary" onClick={onClose}>
                        {t("cancel")}
                    </button>
                    <button
                        className="btn-modal-primary"
                        onClick={() => onConfirm(comment)}
                        disabled={!comment.trim()}
                    >
                        {t("confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default OrderCommentPopup;