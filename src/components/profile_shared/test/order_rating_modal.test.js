import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';



// 1. Zuerst den Hook mocken (bevor die Komponente importiert wird!)
jest.mock('../../api_managers/useOrderRatingManager.js', () => ({
    useOrderRatingManager: jest.fn()
}));

// 2. Mocking für i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// 3. Jetzt die Komponente und den Mock-Hook importieren
import OrderRatingModal from '../OrderRatingModal.js';
import { useOrderRatingManager } from '../../api_managers/useOrderRatingManager.js';

describe('OrderRatingModal Component', () => {
    const mockOnClose = jest.fn();
    const mockOnRatingComplete = jest.fn();

    const mockOrder = {
        orderNumber: '12345',
        seller: { shopName: 'Test Shop', image: 'seller.jpg' },
        items: [{ productId: 'p1', name: 'Product 1' }]
    };

    const mockProducts = [
        { _id: 'p1', name: 'Product 1', images: [{ url: 'prod.jpg' }] }
    ];

    const mockHandleProductRatingChange = jest.fn();
    const mockSubmitRatings = jest.fn();

    beforeEach(() => {
        // Mock-Rückgabewerte definieren
        useOrderRatingManager.mockReturnValue({
            sellerRating: 0,
            setSellerRating: jest.fn(),
            productRatings: { p1: { rating: 0, comment: '' } },
            isSubmitting: false,
            handleProductRatingChange: mockHandleProductRatingChange,
            submitRatings: mockSubmitRatings,
        });
        jest.clearAllMocks();
    });

    test('renders the modal with order details and seller info', () => {
        render(
            <OrderRatingModal
                order={mockOrder}
                products={mockProducts}
                onClose={mockOnClose}
                onRatingComplete={mockOnRatingComplete}
            />
        );

        expect(screen.getByText(/12345/)).toBeInTheDocument();
        expect(screen.getByText('Test Shop')).toBeInTheDocument();
        expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    test('calls onClose when the close button is clicked', () => {
        render(<OrderRatingModal order={mockOrder} products={mockProducts} onClose={mockOnClose} />);

        // Erster Button im Modal ist der Schließen-Button (FaTimes)
        const closeBtn = screen.getAllByRole('button')[0];
        fireEvent.click(closeBtn);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('updates seller rating through the hook', () => {
        const setSellerRatingMock = jest.fn();
        useOrderRatingManager.mockReturnValue({
            sellerRating: 0,
            setSellerRating: setSellerRatingMock,
            productRatings: { p1: { rating: 0, comment: '' } },
            isSubmitting: false,
            handleProductRatingChange: jest.fn(),
            submitRatings: jest.fn(),
        });

        render(<OrderRatingModal order={mockOrder} products={mockProducts} onClose={mockOnClose} />);

        const stars = screen.getAllByRole('button');

        // index 0 = close button
        // index 1-5 = seller stars
        fireEvent.click(stars[5]); // This is the 5th star

        expect(setSellerRatingMock).toHaveBeenCalledWith(5);
    });

    test('updates product comment via textarea', () => {
        render(<OrderRatingModal order={mockOrder} products={mockProducts} onClose={mockOnClose} />);

        const textarea = screen.getByPlaceholderText('add_comment_placeholder');
        fireEvent.change(textarea, { target: { value: 'Great product!' } });

        expect(mockHandleProductRatingChange).toHaveBeenCalledWith('p1', 'comment', 'Great product!');
    });

    test('submits ratings when submit button is clicked', () => {
        render(<OrderRatingModal order={mockOrder} products={mockProducts} onClose={mockOnClose} />);

        const submitBtn = screen.getByText('submit_rating');
        fireEvent.click(submitBtn);

        expect(mockSubmitRatings).toHaveBeenCalled();
    });

    test('shows loading state on submit button when isSubmitting is true', () => {
        useOrderRatingManager.mockReturnValue({
            sellerRating: 5,
            setSellerRating: jest.fn(),
            productRatings: { p1: { rating: 5, comment: '' } },
            isSubmitting: true,
            handleProductRatingChange: jest.fn(),
            submitRatings: jest.fn(),
        });

        render(<OrderRatingModal order={mockOrder} products={mockProducts} onClose={mockOnClose} />);

        const submitBtn = screen.getByText('submitting');
        expect(submitBtn).toBeInTheDocument();
        expect(submitBtn).toBeDisabled();
    });
});