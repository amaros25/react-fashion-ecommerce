import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderItem from '../order_item.js';
import { ORDER_STATUS } from '../../utils/const/order_status.js';

describe('OrderItem Component', () => {
    const mockT = (key) => key;
    const mockOnRateClick = jest.fn();

    const baseItem = {
        productId: 'p1',
        quantity: 2,
        variant: { size: 'M', color: '#FF0000' },
        product: { name: 'Test Product', images: ['image-url'] }
    };

    const baseOrder = {
        orderNumber: 'ORD-123',
        currentStatus: ORDER_STATUS.PENDING,
        sellerId: 's1',
        userId: 'u1'
    };

    // Korrigierte Render-Hilfsfunktion: onRateClick wird jetzt standardmäßig mitgegeben
    const renderComponent = (props = {}) => {
        return render(
            <BrowserRouter>
                <OrderItem
                    item={baseItem}
                    order={baseOrder}
                    t={mockT}
                    onRateClick={mockOnRateClick} // WICHTIG: Hier fehlte die Zuweisung
                    {...props}
                />
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders basic product information correctly', () => {
        renderComponent();
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('M')).toBeInTheDocument();
    });

    test('renders color swatch if color is hex code', () => {
        renderComponent();
        const swatch = screen.getByTitle('#FF0000');
        expect(swatch).toBeInTheDocument();
    });

    test('shows rate button if status is DELIVERED and not yet rated', () => {
        const deliveredOrder = { ...baseOrder, currentStatus: ORDER_STATUS.DELIVERED };
        renderComponent({
            order: deliveredOrder,
            showRatingButton: true,
            viewMode: 'user'
        });

        const rateBtn = screen.getByText(/order_state_buttons.rate/i);
        expect(rateBtn).toBeInTheDocument();

        fireEvent.click(rateBtn);
        expect(mockOnRateClick).toHaveBeenCalledTimes(1);
    });

    test('shows existing stars and "your_product_rating" if item is already rated', () => {
        const ratedItem = {
            ...baseItem,
            product: {
                ...baseItem.product,
                reviews: [{ rating: 4 }]
            }
        };

        const { container } = renderComponent({
            item: ratedItem,
            viewMode: 'user'
        });

        expect(screen.getByText('your_product_rating')).toBeInTheDocument();

        // Da die Icons keine Test-ID haben, suchen wir nach den CSS-Klassen der SVGs
        const activeStars = container.querySelectorAll('.star-active');
        const emptyStars = container.querySelectorAll('.star-empty');

        expect(activeStars.length).toBe(4);
        expect(emptyStars.length).toBe(1);
    });

    test('does not show rate button in seller view', () => {
        const deliveredOrder = { ...baseOrder, currentStatus: ORDER_STATUS.DELIVERED };
        renderComponent({
            order: deliveredOrder,
            showRatingButton: true,
            viewMode: 'seller'
        });

        expect(screen.queryByText(/order_state_buttons.rate/i)).not.toBeInTheDocument();
    });
});