import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import OrderStatusStepper from '../order_status_stepper.js';

describe('OrderStatusStepper Component', () => {
    const mockT = (key) => key;

    const baseOrder = {
        is_delivery: true,
        currentStatus: 0, // PENDING
        statusHistory: [
            // Wir fügen 'timestamp' hinzu, da die Komponente danach sucht
            { status: 0, timestamp: '2026-01-01T10:00:00Z', createdAt: '2026-01-01T10:00:00Z' }
        ]
    };

    // Hilfsfunktion mit act() um die Warnung zu vermeiden
    const setMobile = (isMobile) => {
        act(() => {
            global.innerWidth = isMobile ? 500 : 1024;
            global.dispatchEvent(new Event('resize'));
        });
    };

    test('renders initial pending state correctly in delivery flow', () => {
        render(<OrderStatusStepper order={baseOrder} t={mockT} />);
        expect(screen.getByText('order_state.pending')).toBeInTheDocument();
        expect(screen.getByText('order_state.delivered')).toBeInTheDocument();
    });

    test('highlights the current status and marks previous as completed', () => {
        const shippedOrder = {
            ...baseOrder,
            currentStatus: 2, // SHIPPED
            statusHistory: [
                { status: 0, timestamp: '2026-01-01T10:00:00Z' },
                { status: 1, timestamp: '2026-01-01T11:00:00Z' },
                { status: 2, timestamp: '2026-01-01T12:00:00Z' }
            ]
        };

        const { container } = render(<OrderStatusStepper order={shippedOrder} t={mockT} />);
        const items = container.querySelectorAll('.stepper-item');
        expect(items[0]).toHaveClass('completed');
        expect(items[2]).toHaveClass('current');
    });

    test('shows "X" icon and "failed" class for failed statuses', () => {
        const cancelledOrder = {
            ...baseOrder,
            currentStatus: 30, // CANCELLED_USER
            statusHistory: [
                { status: 0, timestamp: '2026-01-01T10:00:00Z' },
                { status: 30, timestamp: '2026-01-01T11:00:00Z' }
            ]
        };

        const { container } = render(<OrderStatusStepper order={cancelledOrder} t={mockT} />);
        expect(container.querySelector('.stepper-item.failed')).toBeInTheDocument();
        expect(screen.getByText('✕')).toBeInTheDocument();
    });

    test('mobile view: collapses history by default and expands on click', () => {
        setMobile(true);
        const manyStepsOrder = {
            ...baseOrder,
            currentStatus: 1, // CONFIRMED
            statusHistory: [
                { status: 0, timestamp: '2026-01-01T10:00:00Z' },
                { status: 1, timestamp: '2026-01-01T11:00:00Z' }
            ]
        };

        render(<OrderStatusStepper order={manyStepsOrder} t={mockT} />);

        // Im mobilen Modus (kollabiert) wird nur der aktuelle Schritt (confirmed) gezeigt
        expect(screen.queryByText('order_state.pending')).not.toBeInTheDocument();
        expect(screen.getByText('order_state.confirmed')).toBeInTheDocument();

        const toggleBtn = screen.getByRole('button');
        fireEvent.click(toggleBtn);

        expect(screen.getByText('order_state.pending')).toBeInTheDocument();

        setMobile(false);
    });

    test('displays formatted dates when history is available', () => {
        // WICHTIG: Die Komponente nutzt getDate(log), welches log.timestamp oder log.date erwartet
        const orderWithDate = {
            ...baseOrder,
            statusHistory: [
                { status: 0, timestamp: '2026-05-20T10:00:00Z' }
            ]
        };

        render(<OrderStatusStepper order={orderWithDate} t={mockT} />);

        // Wir suchen flexibel nach "20", da toLocaleString je nach System "20.5.26" oder "5/20/26" ausgibt
        const dateElement = screen.getByText((content, element) => {
            return element.classList.contains('step-date') && content.includes('26');
        });

        expect(dateElement).toBeInTheDocument();
    });
});