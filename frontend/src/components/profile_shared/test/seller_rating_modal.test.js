import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import SellerRatingModal from '../seller_rating_modal'; // Pfad anpassen falls nötig

// Mocking toast
jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn()
    }
}));

// Mocking i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

describe('SellerRatingModal Component', () => {
    const mockOnClose = jest.fn();
    const mockOnRatingComplete = jest.fn();

    const mockOrder = {
        id: 'order_999',
        orderNumber: 'ORD-12345',
        sellerId: 'seller_777',
        seller: {
            shopName: 'Astra Shop',
            image: 'astra_logo.png'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock global fetch
        global.fetch = jest.fn();

        // Mock LocalStorage
        Storage.prototype.getItem = jest.fn((key) => {
            if (key === 'token') return 'fake-token';
            if (key === 'userId') return 'user_abc';
            return null;
        });
    });

    test('renders seller details and order number', () => {
        render(<SellerRatingModal order={mockOrder} onClose={mockOnClose} />);

        expect(screen.getByText('rate_seller')).toBeInTheDocument();
        expect(screen.getByText('Astra Shop')).toBeInTheDocument();
        expect(screen.getByText(/ORD-12345/)).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'astra_logo.png');
    });

    test('validates that a rating is selected before submission', async () => {
        render(<SellerRatingModal order={mockOrder} onClose={mockOnClose} />);

        const submitBtn = screen.getByText('submit_rating');
        fireEvent.click(submitBtn);

        expect(toast.error).toHaveBeenCalledWith('please_select_rating');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('successfully submits seller rating', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(
            <SellerRatingModal
                order={mockOrder}
                onClose={mockOnClose}
                onRatingComplete={mockOnRatingComplete}
            />
        );

        // 1. Sterne auswählen (Buttons: Index 0=Close, Index 1-5=Sterne)
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[4]); // Klickt auf den 4. Stern (Bewertung 4)

        // 2. Kommentar schreiben
        const textarea = screen.getByPlaceholderText('seller_review_placeholder');
        fireEvent.change(textarea, { target: { value: 'Very fast delivery!' } });

        // 3. Absenden
        const submitBtn = screen.getByText('submit_rating');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/reviews/seller'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        sellerId: 'seller_777',
                        orderId: 'order_999',
                        userId: 'user_abc',
                        rating: 4,
                        comment: 'Very fast delivery!'
                    })
                })
            );
            expect(toast.success).toHaveBeenCalledWith('seller_rating_submitted_success');
            expect(mockOnRatingComplete).toHaveBeenCalled();
        });
    });

    test('handles API error during submission', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false });

        render(<SellerRatingModal order={mockOrder} onClose={mockOnClose} />);

        // Rating setzen um Fehler-Toast zu provozieren
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[5]); // 5 Sterne

        const submitBtn = screen.getByText('submit_rating');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('rating_submit_error');
        });
    });

    test('calls onClose when close button is clicked', () => {
        render(<SellerRatingModal order={mockOrder} onClose={mockOnClose} />);

        const closeBtn = screen.getAllByRole('button')[0];
        fireEvent.click(closeBtn);

        expect(mockOnClose).toHaveBeenCalled();
    });
});