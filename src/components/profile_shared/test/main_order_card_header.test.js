import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainOrderCardHeader from '../main_order_card_header.js';
import { BrowserRouter } from 'react-router-dom';

// Mocking FontAwesome icons to avoid render issues in test environment
jest.mock('react-icons/fa', () => ({
    FaStar: () => <div data-testid="full-star" />,
    FaRegStar: () => <div data-testid="empty-star" />,
    FaExclamationCircle: () => <div data-testid="report-icon" />
}));

describe('MainOrderCardHeader Component', () => {
    const mockT = (key) => key;
    const mockOrder = {
        orderNumber: 'ORD-555',
        totalPrice: 120.000,
        seller: { shopName: 'Fashion Store' },
        sellerReview: null
    };

    // Helper to render component with required props to avoid "is not a function" errors
    const renderHeader = (customProps = {}) => {
        const defaultProps = {
            order: mockOrder,
            viewMode: "user",
            t: mockT,
            formattedDate: "18.01.2026",
            isDelivery: true,
            canRateSeller: jest.fn(() => false), // Default mock function
            setIsSellerModalOpen: jest.fn(),
            navigate: jest.fn(),
        };

        return render(
            <BrowserRouter>
                <MainOrderCardHeader {...defaultProps} {...customProps} />
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test: Basic Rendering
    test('renders shop name and order number correctly for user', () => {
        renderHeader();

        // Check if essential text data is displayed
        expect(screen.getByText('Fashion Store')).toBeInTheDocument();
        expect(screen.getByText('ORD-555')).toBeInTheDocument();
        expect(screen.getByText('18.01.2026')).toBeInTheDocument();
    });

    // Test: Seller Rating Stars
    test('renders existing seller rating stars', () => {
        const orderWithReview = {
            ...mockOrder,
            sellerReview: { rating: 3 }
        };

        renderHeader({ order: orderWithReview });

        // Verify star count logic (3 full stars)
        const fullStars = screen.getAllByTestId('full-star');
        expect(fullStars.length).toBe(3);
    });

    // Test: "Rate Seller" Button Logic
    test('shows "rate seller" button if canRateSeller returns true', () => {
        const setIsModalOpen = jest.fn();

        renderHeader({
            canRateSeller: () => true,
            setIsSellerModalOpen: setIsModalOpen
        });

        // Click the rating button
        const rateBtn = screen.getByText('rate_seller');
        fireEvent.click(rateBtn);

        // Verify state update was triggered
        expect(setIsModalOpen).toHaveBeenCalledWith(true);
    });

    // Test: Report Navigation (Fixed the crash here)
    test('navigates to help-center on report click', () => {
        const mockNavigate = jest.fn();

        // canRateSeller is now safely provided by renderHeader helper
        renderHeader({ navigate: mockNavigate });

        const reportBtn = screen.getByText('report_order');
        fireEvent.click(reportBtn);

        // Verify navigation logic and state passing
        expect(mockNavigate).toHaveBeenCalledWith("/help-center", {
            state: { orderNumber: 'ORD-555' }
        });
    });
});