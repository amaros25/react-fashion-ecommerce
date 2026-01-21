import React from "react";
import SellerRatingModal from "./seller_rating_modal.js";
import ProductRatingModal from "./product_rating_modal.js";
import OrderCommentPopup from "../order_comment/order_comment_popup.js";

const MainOrderCardModals = ({
    isSellerModalOpen, order, setIsSellerModalOpen, onRatingComplete,
    selectedProductId, setSelectedProductId, setHasRated,
    commentModal, setCommentModal, onStatusChange, t
}) => {
    return (
        <>
            {isSellerModalOpen && (
                <SellerRatingModal
                    order={order}
                    onClose={() => setIsSellerModalOpen(false)}
                    onRatingComplete={() => {
                        setIsSellerModalOpen(false);
                        onRatingComplete?.();
                    }}
                />
            )}
            {selectedProductId && (
                <ProductRatingModal
                    order={order} productId={selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                    onRatingComplete={() => { setHasRated(true); setSelectedProductId(null); onRatingComplete?.(); }}
                />
            )}
            <OrderCommentPopup
                isOpen={commentModal.isOpen}
                onClose={() => setCommentModal({ isOpen: false, targetStatus: null })}
                onConfirm={(comment) => {
                    onStatusChange(order.id, commentModal.targetStatus, comment);
                    setCommentModal({ isOpen: false });
                }}
                statusLabel={commentModal.targetStatus ? t(`order_state.${commentModal.targetStatus}`) : ""}
                t={t}
            />
        </>
    );
};

export default MainOrderCardModals;