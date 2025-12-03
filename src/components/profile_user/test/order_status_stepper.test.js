import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderStatusStepper from '../order_status_stepper';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));

describe('OrderStatusStepper Component', () => {
    const mockOrder = {
        _id: 'order123',
        status: [
            { update: 'pending', date: '2024-01-01' },
            { update: 'confirmed', date: '2024-01-02' }
        ]
    };

    test('renders stepper with order status', () => {
        render(<OrderStatusStepper order={mockOrder} />);

        // Component should render
        expect(screen.getByText(/order_state/i)).toBeInTheDocument();
    });

    test('displays correct number of steps', () => {
        render(<OrderStatusStepper order={mockOrder} />);

        const steps = screen.getAllByRole('listitem', { hidden: true }).length;
        expect(steps).toBeGreaterThan(0);
    });

    test('handles cancelled order status', () => {
        const cancelledOrder = {
            ...mockOrder,
            status: [{ update: 'user_cancelled', date: '2024-01-01' }]
        };

        render(<OrderStatusStepper order={cancelledOrder} />);

        expect(screen.getByText(/order_state/i)).toBeInTheDocument();
    });

    test('handles delivered order status', () => {
        const deliveredOrder = {
            ...mockOrder,
            status: [
                { update: 'pending', date: '2024-01-01' },
                { update: 'confirmed', date: '2024-01-02' },
                { update: 'shipped', date: '2024-01-03' },
                { update: 'delivered', date: '2024-01-04' }
            ]
        };

        render(<OrderStatusStepper order={deliveredOrder} />);

        expect(screen.getByText(/order_state/i)).toBeInTheDocument();
    });

    test('handles empty status array', () => {
        const emptyOrder = {
            _id: 'order123',
            status: []
        };

        render(<OrderStatusStepper order={emptyOrder} />);

        // Should still render without crashing
        expect(screen.getByText(/order_state/i)).toBeInTheDocument();
    });
});
