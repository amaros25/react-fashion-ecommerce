import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';

// 1. Mock the Manager and Toast before imports
jest.mock('../../api_managers/useProductRatingManager', () => ({
    useProductRatingManager: jest.fn()
}));

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn()
    }
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// 2. Import component and mocked hook
import ProductRatingModal from '../product_rating_modal';
import { useProductRatingManager } from '../../api_managers/useProductRatingManager';

// 3. Setup Fetch Mock
global.fetch = jest.fn();

describe('ProductRatingModal Component', () => {
    const mockOnClose = jest.fn();
    const mockOnRatingComplete = jest.fn();

    const mockOrder = {
        id: 'order_123',
        items: [
            {
                productId: 'p1',
                name: 'Product 1',
                product: { name: 'Product 1', images: ['image1.jpg'] }
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Return a dummy manager object
        useProductRatingManager.mockReturnValue({});

        // Setup local storage
        Storage.prototype.getItem = jest.fn((key) => {
            if (key === 'token') return 'mock-token';
            if (key === 'userId') return 'user_123';
            return null;
        });
    });

    test('renders correctly with product information', () => {
        render(
            <ProductRatingModal
                order={mockOrder}
                productId="p1"
                onClose={mockOnClose}
                onRatingComplete={mockOnRatingComplete}
            />
        );

        expect(screen.getByText('rate_product')).toBeInTheDocument();
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'image1.jpg');
    });

    test('shows error toast if submitting without rating', async () => {
        render(<ProductRatingModal order={mockOrder} productId="p1" />);

        const submitBtn = screen.getByText('submit_rating');
        fireEvent.click(submitBtn);

        expect(toast.error).toHaveBeenCalledWith('please_select_rating');
    });

    test('submits rating successfully and calls onRatingComplete', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(
            <ProductRatingModal
                order={mockOrder}
                productId="p1"
                onRatingComplete={mockOnRatingComplete}
            />
        );

        // 1. Click the 5th star
        const stars = screen.getAllByRole('button');
        fireEvent.click(stars[5]); // Index 0 is Close, 1-5 are stars. index 5 = 5 stars.

        // 2. Type comment
        const textarea = screen.getByPlaceholderText('add_comment_placeholder');
        fireEvent.change(textarea, { target: { value: 'Excellent!' } });

        // 3. Submit
        const submitBtn = screen.getByText('submit_rating');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/reviews/product'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        productId: 'p1',
                        orderId: 'order_123',
                        userId: 'user_123',
                        rating: 5,
                        comment: 'Excellent!'
                    })
                })
            );
            expect(toast.success).toHaveBeenCalledWith('rating_submitted_success');
            expect(mockOnRatingComplete).toHaveBeenCalled();
        });
    });

    test('handles submission error gracefully', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false });

        render(<ProductRatingModal order={mockOrder} productId="p1" />);

        // Click a star to allow submission
        const stars = screen.getAllByRole('button');
        fireEvent.click(stars[3]);

        const submitBtn = screen.getByText('submit_rating');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('rating_submit_error');
        });
    });
});