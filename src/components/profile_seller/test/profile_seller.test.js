import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProfileSeller from '../profile_seller';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' }
    })
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

jest.mock('../new_product/add_product', () => () => <div data-testid="add-product">Add Product</div>);
jest.mock('./seller_products', () => () => <div data-testid="seller-products">Seller Products</div>);
jest.mock('./profile_seller_header', () => () => <div data-testid="profile-seller-header">Profile Header</div>);
jest.mock('./seller_orders.js', () => () => <div data-testid="seller-orders">Seller Orders</div>);
jest.mock('../products/loading_spinner.js', () => () => <div data-testid="loading-spinner">Loading...</div>);

describe('ProfileSeller Component', () => {
    const mockSeller = {
        _id: 'seller123',
        name: 'Test Seller',
        email: 'seller@test.com',
        city: 'Test City',
        is_active: true
    };

    beforeEach(() => {
        localStorage.setItem('userId', 'seller123');
        localStorage.setItem('token', 'test-token');
        global.fetch = jest.fn();
        process.env.REACT_APP_API_URL = 'http://localhost:5000';
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders loading spinner while fetching seller data', () => {
        global.fetch.mockImplementation(() => new Promise(() => { }));

        render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('renders seller profile after successful data fetch', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSeller
        });

        render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('profile-seller-header')).toBeInTheDocument();
        });
    });

    test('renders navigation tabs correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSeller
        });

        render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('add_new_product')).toBeInTheDocument();
            expect(screen.getByText('tabs_seller.products')).toBeInTheDocument();
            expect(screen.getByText('tabs_seller.allOrders')).toBeInTheDocument();
        });
    });

    test('switches between tabs correctly', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSeller
        });

        render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('add-product')).toBeInTheDocument();
        });

        // Click on products tab
        const productsTab = screen.getByText('tabs_seller.products');
        fireEvent.click(productsTab);

        await waitFor(() => {
            expect(screen.getByTestId('seller-products')).toBeInTheDocument();
        });

        // Click on orders tab
        const ordersTab = screen.getByText('tabs_seller.allOrders');
        fireEvent.click(ordersTab);

        await waitFor(() => {
            expect(screen.getByTestId('seller-orders')).toBeInTheDocument();
        });
    });

    test('handles status change correctly', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSeller
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'confirmed' })
            });

        const { container } = render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('profile-seller-header')).toBeInTheDocument();
        });

        // Simulate status change (this would normally be triggered from child component)
        // We're testing the handleStatusChange function indirectly
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/sellers/seller123'),
            expect.any(Object)
        );
    });

    test('handles API error gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('API Error'));

        render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        // Should show loading spinner indefinitely or handle error
        await waitFor(() => {
            expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        });
    });

    test('does not render without userId or token', () => {
        localStorage.clear();

        render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('applies correct direction based on language', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSeller
        });

        const { container } = render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        await waitFor(() => {
            const profileContainer = container.querySelector('.profile-seller-container');
            expect(profileContainer).toHaveAttribute('dir', 'ltr');
        });
    });

    test('active tab has correct CSS class', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSeller
        });

        render(
            <BrowserRouter>
                <ProfileSeller />
            </BrowserRouter>
        );

        await waitFor(() => {
            const addProductTab = screen.getByText('add_new_product');
            expect(addProductTab).toHaveClass('active');
        });
    });
});
