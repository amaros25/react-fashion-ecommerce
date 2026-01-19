import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainOrderCard from '../main_order_card.js';
import { ORDER_STATUS } from '../../utils/const/order_status.js';

// 1. MOCK: Navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// 2. MOCK: Sub-components
// WICHTIG: Der Footer-Mock muss beide Render-Props ausführen, damit die Buttons im Test-DOM landen
jest.mock('../main_order_card_header.js', () => () => <div data-testid="header-mock" />);
jest.mock('../main_order_card_footer.js', () => ({ renderUserButtons, renderSellerButtons }) => (
    <div data-testid="footer-mock">
        {renderUserButtons && renderUserButtons()}
        {renderSellerButtons && renderSellerButtons()}
    </div>
));
jest.mock('../main_order_card_modals.js', () => () => <div data-testid="modals-mock" />);
jest.mock('../order_item.js', () => () => <div data-testid="order-item-mock" />);

describe('MainOrderCard Component - Comprehensive Integration', () => {
    const mockT = (key) => key;
    const mockOnStatusChange = jest.fn();

    const baseOrder = {
        id: '123',
        orderNumber: 'ORD-XYZ',
        currentStatus: ORDER_STATUS.PENDING,
        is_delivery: true,
        items: [{ id: 'i1', productId: 'p1' }],
        sellerId: 's1',
        userId: 'u1',
        buyer: { firstName: 'John', lastName: 'Doe' },
        statusHistory: []
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("userId", "u1");
    });

    // --- RENDER & STRUCTURE ---
    test('renders all modular sub-components correctly', () => {
        render(
            <BrowserRouter>
                <MainOrderCard order={baseOrder} products={[]} t={mockT} />
            </BrowserRouter>
        );
        expect(screen.getByTestId('header-mock')).toBeInTheDocument();
        expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
        expect(screen.getByTestId('order-item-mock')).toBeInTheDocument();
    });

    // --- USER ACTIONS ---
    test('executes status change to CANCELLED_USER when user cancels pending order', () => {
        render(
            <BrowserRouter>
                <MainOrderCard
                    order={baseOrder}
                    products={[]}
                    t={mockT}
                    viewMode="user"
                    onStatusChange={mockOnStatusChange}
                />
            </BrowserRouter>
        );

        const cancelBtn = screen.getAllByText('order_state_buttons.cancel');
        fireEvent.click(cancelBtn[0]);

        expect(mockOnStatusChange).toHaveBeenCalledWith('123', ORDER_STATUS.CANCELLED_USER);
    });

    // --- SELLER ACTIONS & FLOWS ---
    test('seller: shows Confirm/Cancel buttons and allows confirmation in PENDING', () => {
        render(
            <BrowserRouter>
                <MainOrderCard
                    order={baseOrder}
                    products={[]}
                    t={mockT}
                    viewMode="seller"
                    onStatusChange={mockOnStatusChange}
                />
            </BrowserRouter>
        );

        expect(screen.getByText('order_state_buttons.confirm')).toBeInTheDocument();
        const confirmBtn = screen.getByText('order_state_buttons.confirm');

        fireEvent.click(confirmBtn);
        expect(mockOnStatusChange).toHaveBeenCalledWith('123', ORDER_STATUS.CONFIRMED);
    });

    test('seller: shows correct shipping/pickup labels based on order type', () => {
        const { rerender } = render(
            <BrowserRouter>
                <MainOrderCard
                    order={{ ...baseOrder, currentStatus: ORDER_STATUS.CONFIRMED, is_delivery: true }}
                    products={[]} t={mockT} viewMode="seller"
                />
            </BrowserRouter>
        );
        expect(screen.getByText('order_state_buttons.mark_shipped')).toBeInTheDocument();

        rerender(
            <BrowserRouter>
                <MainOrderCard
                    order={{ ...baseOrder, currentStatus: ORDER_STATUS.CONFIRMED, is_delivery: false }}
                    products={[]} t={mockT} viewMode="seller"
                />
            </BrowserRouter>
        );
        expect(screen.getByText('order_state_buttons.ready_pickup')).toBeInTheDocument();
    });

    test('seller: triggers modal (no direct onStatusChange) for failure status', () => {
        render(
            <BrowserRouter>
                <MainOrderCard
                    order={{ ...baseOrder, currentStatus: ORDER_STATUS.SHIPPED }}
                    products={[]} t={mockT} viewMode="seller"
                    onStatusChange={mockOnStatusChange}
                />
            </BrowserRouter>
        );

        const failBtn = screen.getByText('order_state_buttons.first_try_delivery_failed');
        fireEvent.click(failBtn);

        // onStatusChange darf NICHT aufgerufen werden, da handleStatusUpdateInitiated das Modal öffnet
        expect(mockOnStatusChange).not.toHaveBeenCalled();
    });

    // --- CHAT LOGIC ---
    test('chat button visibility and correct partner navigation', () => {
        // CONFIRMED status allows chat
        const chatOrder = { ...baseOrder, currentStatus: ORDER_STATUS.CONFIRMED };

        render(
            <BrowserRouter>
                <MainOrderCard order={chatOrder} products={[]} t={mockT} viewMode="user" />
            </BrowserRouter>
        );

        const chatBtn = screen.getByText('chat_seller');
        fireEvent.click(chatBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/chat', expect.objectContaining({
            state: expect.objectContaining({ partnerId: 's1', newChatType: 'order' })
        }));
    });

    // --- SECURITY/VIEWMODE CHECK ---
    test('seller view displays customer name but user view does not', () => {
        const { rerender } = render(
            <BrowserRouter>
                <MainOrderCard order={baseOrder} products={[]} t={mockT} viewMode="seller" />
            </BrowserRouter>
        );
        expect(screen.getByText('John Doe')).toBeInTheDocument();

        rerender(
            <BrowserRouter>
                <MainOrderCard order={baseOrder} products={[]} t={mockT} viewMode="user" />
            </BrowserRouter>
        );
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
});