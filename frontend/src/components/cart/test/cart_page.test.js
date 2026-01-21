import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartPage from '../cart_page';
import * as api from '../hooks/api';

console.log('CartPage import:', CartPage);

// Mock dependencies
jest.mock('../hooks/api');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en', changeLanguage: jest.fn() },
    }),
}));
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

// Mock react-icons
jest.mock("react-icons/fa", () => ({
    FaTrash: () => <span data-testid="icon-trash" />,
    FaArrowRight: () => <span data-testid="icon-arrow-right" />,
    FaShoppingBag: () => <span data-testid="icon-shopping-bag" />,
    FaStore: () => <span data-testid="icon-store" />
}));

// Mock utils
jest.mock('../../utils/const/cities', () => ({
    cities: ['City1', 'City2'],
    citiesData: [['SubCity1'], ['SubCity2']]
}), { virtual: true }); // virtual: true in case path doesn't match exactly in test env

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

describe('CartPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        // Setup mock local storage and api responses
        api.fetchSellersByIds.mockResolvedValue({ success: true, data: {} });
    });

    const renderCartPage = () => {
        return render(
            <CartPage />
        );
    };

    it('renders empty cart message when cart is empty', () => {
        renderCartPage();
        expect(screen.getByText('cart_page.empty_cart')).toBeInTheDocument();
    });

    it('renders cart items when cart is populated', async () => {
        const mockCart = [
            { productId: 'p1', sellerId: 's1', name: 'Product 1', price: 10, quantity: 1, image: 'img.jpg' }
        ];
        const mockSellers = {
            's1': { _id: 's1', shopName: 'Seller 1' }
        };

        localStorage.setItem('cart', JSON.stringify(mockCart));
        api.fetchSellersByIds.mockResolvedValue({ success: true, data: mockSellers });

        renderCartPage();

        await waitFor(() => {
            expect(screen.getByText('Seller 1')).toBeInTheDocument();
        });
        expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    it('calculates totals correctly', async () => {
        const mockCart = [
            { productId: 'p1', sellerId: 's1', name: 'P1', price: 10, quantity: 2, delprice: 5 }, // 20 + 5 = 25
        ];
        const mockSellers = { 's1': { _id: 's1', shopName: 'Seller 1' } };
        localStorage.setItem('cart', JSON.stringify(mockCart));
        api.fetchSellersByIds.mockResolvedValue({ success: true, data: mockSellers });

        renderCartPage();

        await waitFor(() => {
            // Subtotal: 20
            // Shipping: 5
            // Total: 25.000 (toFixed(3))
            expect(screen.getAllByText(/25.000/)[0]).toBeInTheDocument();
        });
    });

    it('redirects to login on checkout if user not logged in', async () => {
        const mockCart = [{ productId: 'p1', sellerId: 's1', price: 10, quantity: 1 }];
        localStorage.setItem('cart', JSON.stringify(mockCart));
        api.fetchSellersByIds.mockResolvedValue({ success: true, data: {} });

        renderCartPage();

        // Switch to Pickup to enable checkout button (address not required for pickup)
        const pickupBtn = screen.getByText(/cart_page.pickup/i);
        fireEvent.click(pickupBtn);

        await waitFor(() => screen.getByText('product_page.submit_order'));

        const checkoutBtn = screen.getByText('product_page.submit_order');
        fireEvent.click(checkoutBtn);

        expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
});
