import React from 'react';
import { render, screen } from '@testing-library/react';
import MainOrderCardFooter from '../main_order_card_footer.js';

// MOCK: We mock the Stepper to isolate the Footer's logic and avoid path issues during unit testing
jest.mock('../order_status_stepper.js', () => {
    return function DummyStepper({ order }) {
        return <div data-testid="mock-stepper">Stepper for {order.orderNumber}</div>;
    };
});

describe('MainOrderCardFooter Component', () => {
    const mockT = (key) => key;
    const mockOrder = {
        id: '123',
        orderNumber: 'ORD-100',
        currentStatus: 1
    };

    // MOCK: Mocking the render functions that are normally passed down from the parent (MainOrderCard)
    const mockRenderUserButtons = jest.fn(() => <button>User Action Button</button>);
    const mockRenderSellerButtons = jest.fn(() => <button>Seller Action Button</button>);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test: User View Mode
    test('renders Stepper and triggers only User buttons in user viewMode', () => {
        render(
            <MainOrderCardFooter
                order={mockOrder}
                t={mockT}
                viewMode="user"
                renderUserButtons={mockRenderUserButtons}
                renderSellerButtons={mockRenderSellerButtons}
            />
        );

        // CHECK: Ensure the stepper is present regardless of mode
        expect(screen.getByTestId('mock-stepper')).toBeInTheDocument();

        // CHECK: Verify that the user button is visible
        expect(screen.getByText('User Action Button')).toBeInTheDocument();

        // CHECK: Ensure seller buttons are NOT rendered
        expect(screen.queryByText('Seller Action Button')).not.toBeInTheDocument();

        // VERIFY: The correct callback function was executed
        expect(mockRenderUserButtons).toHaveBeenCalled();
        expect(mockRenderSellerButtons).not.toHaveBeenCalled();
    });

    // Test: Seller View Mode
    test('renders Stepper and triggers only Seller buttons in seller viewMode', () => {
        render(
            <MainOrderCardFooter
                order={mockOrder}
                t={mockT}
                viewMode="seller"
                renderUserButtons={mockRenderUserButtons}
                renderSellerButtons={mockRenderSellerButtons}
            />
        );

        // CHECK: Verify that the seller button is visible
        expect(screen.getByText('Seller Action Button')).toBeInTheDocument();

        // CHECK: Ensure user buttons are NOT rendered
        expect(screen.queryByText('User Action Button')).not.toBeInTheDocument();

        // VERIFY: The correct callback function was executed
        expect(mockRenderSellerButtons).toHaveBeenCalled();
        expect(mockRenderUserButtons).not.toHaveBeenCalled();
    });

    // Test: Layout structure
    test('contains the correct CSS classes for styling', () => {
        const { container } = render(
            <MainOrderCardFooter
                order={mockOrder}
                t={mockT}
                viewMode="user"
                renderUserButtons={mockRenderUserButtons}
                renderSellerButtons={mockRenderSellerButtons}
            />
        );

        // CHECK: The main footer container class
        expect(container.firstChild).toHaveClass('order-card-footer');

        // CHECK: The container for action buttons
        const actionRow = container.querySelector('.seller-actions-row');
        expect(actionRow).toBeInTheDocument();
    });
});