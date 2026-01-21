import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainOrderCardModals from '../main_order_card_modals.js';

// MOCK: Sub-components because we want to test the logic of visibility and callbacks
jest.mock('../seller_rating_modal.js', () => ({ onClose, onRatingComplete }) => (
    <div data-testid="seller-modal">
        <button onClick={onClose}>Close Seller</button>
        <button onClick={onRatingComplete}>Complete Seller</button>
    </div>
));

jest.mock('../product_rating_modal.js', () => ({ onClose, onRatingComplete }) => (
    <div data-testid="product-modal">
        <button onClick={onClose}>Close Product</button>
        <button onClick={onRatingComplete}>Complete Product</button>
    </div>
));

jest.mock('../../order_comment/order_comment_popup.js', () => ({ isOpen, onClose, onConfirm }) => (
    isOpen ? (
        <div data-testid="comment-popup">
            <button onClick={onClose}>Close Comment</button>
            <button onClick={() => onConfirm('Test Comment')}>Confirm Comment</button>
        </div>
    ) : null
));

describe('MainOrderCardModals Component', () => {
    const mockT = (key) => key;
    const mockOrder = { id: 'order_123' };

    // Standard mock functions for props
    const setupProps = () => ({
        order: mockOrder,
        t: mockT,
        isSellerModalOpen: false,
        setIsSellerModalOpen: jest.fn(),
        onRatingComplete: jest.fn(),
        selectedProductId: null,
        setSelectedProductId: jest.fn(),
        setHasRated: jest.fn(),
        commentModal: { isOpen: false, targetStatus: null },
        setCommentModal: jest.fn(),
        onStatusChange: jest.fn(),
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- SELLER MODAL TESTS ---
    test('renders and handles SellerRatingModal correctly', () => {
        const props = setupProps();
        props.isSellerModalOpen = true;

        render(<MainOrderCardModals {...props} />);

        // Verification: Modal visibility
        expect(screen.getByTestId('seller-modal')).toBeInTheDocument();

        // Verification: Close callback
        fireEvent.click(screen.getByText('Close Seller'));
        expect(props.setIsSellerModalOpen).toHaveBeenCalledWith(false);

        // Verification: Completion logic
        fireEvent.click(screen.getByText('Complete Seller'));
        expect(props.setIsSellerModalOpen).toHaveBeenCalledWith(false);
        expect(props.onRatingComplete).toHaveBeenCalled();
    });

    // --- PRODUCT MODAL TESTS ---
    test('renders and handles ProductRatingModal correctly', () => {
        const props = setupProps();
        props.selectedProductId = 'prod_abc';

        render(<MainOrderCardModals {...props} />);

        // Verification: Modal visibility
        expect(screen.getByTestId('product-modal')).toBeInTheDocument();

        // Verification: Completion triggers local and parent states
        fireEvent.click(screen.getByText('Complete Product'));
        expect(props.setHasRated).toHaveBeenCalledWith(true);
        expect(props.setSelectedProductId).toHaveBeenCalledWith(null);
        expect(props.onRatingComplete).toHaveBeenCalled();
    });

    // --- COMMENT POPUP TESTS ---
    test('renders and handles OrderCommentPopup correctly', () => {
        const props = setupProps();
        props.commentModal = { isOpen: true, targetStatus: 5 };

        render(<MainOrderCardModals {...props} />);

        // Verification: Popup visibility
        expect(screen.getByTestId('comment-popup')).toBeInTheDocument();

        // Verification: Confirm action triggers status change with comment
        fireEvent.click(screen.getByText('Confirm Comment'));
        expect(props.onStatusChange).toHaveBeenCalledWith(mockOrder.id, 5, 'Test Comment');
        expect(props.setCommentModal).toHaveBeenCalledWith({ isOpen: false });
    });

    test('handles closing of OrderCommentPopup', () => {
        const props = setupProps();
        props.commentModal = { isOpen: true, targetStatus: 5 };

        render(<MainOrderCardModals {...props} />);

        fireEvent.click(screen.getByText('Close Comment'));
        expect(props.setCommentModal).toHaveBeenCalledWith({ isOpen: false, targetStatus: null });
    });
});