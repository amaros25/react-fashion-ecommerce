import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./order_comment_popup.css";

const OrderCommentPopup = ({ isOpen, onClose, onConfirm, statusLabel, t }) => {
    const [comment, setComment] = useState("");
    const MAX_LENGTH = 100; // Begrenzung auf ca. 2 kurze Sätze

    useEffect(() => {
        if (!isOpen) setComment("");
    }, [isOpen]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="status-modal-overlay" onClick={onClose}>
            <div
                className="status-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <h3>{t("order_state_update")}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{t("please_provide_reason")}</p>

                <textarea
                    className="status-comment-textarea"
                    placeholder={t("write_comment_placeholder")}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={MAX_LENGTH} // Verhindert mehr Text in der UI
                    autoFocus
                />

                {/* Anzeige der verbleibenden Zeichen für den Seller */}
                <div style={{ fontSize: '0.75rem', color: '#999', textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
                    {comment.length} / {MAX_LENGTH}
                </div>

                <div className="status-modal-actions">
                    <button className="btn-modal-secondary" onClick={onClose}>
                        {t("cancel")}
                    </button>
                    <button
                        className="btn-modal-primary"
                        onClick={() => onConfirm(comment)}
                        disabled={!comment.trim() || comment.length > MAX_LENGTH}
                    >
                        {t("confirm")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OrderCommentPopup;