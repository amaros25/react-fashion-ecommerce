import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProfileUser from '../profile_user.js';

// 1. Mocks für externe Bibliotheken
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    })
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

// Mock für AuthContext und useAuth Hook
import { useAuth } from '../../../context/AuthContext';
jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

// Mock für den Navigate Hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// 2. Mocks für deine Custom Hooks (API Manager)
const mockUpdateStatus = jest.fn();
jest.mock('../../api_managers/userProfileHookManager', () => ({
    useUserProfileManager: jest.fn()
}));

jest.mock('../../api_managers/useUserOrderManager', () => ({
    useOrderManager: jest.fn()
}));

// 3. Mocks für Kind-Komponenten
jest.mock('../../loading/loading_spinner', () => {
    return function MockSpinner() { return <div data-testid="loading-spinner">Loading...</div>; };
});

jest.mock('../../profile_shared/main_profile_header', () => {
    return function MockHeader() { return <div data-testid="profile-header">Profile Header</div>; };
});
jest.mock('../../profile_shared/main_order_card', () => {
    return function MockOrderCard({ onStatusChange }) {
        return (
            <div data-testid="order-card">
                <button onClick={() => onStatusChange('order123', 'cancelled')}>Cancel Order</button>
            </div>
        );
    };
});
jest.mock('../../home/pagination', () => {
    return function MockPagination() { return <div data-testid="pagination">Pagination</div>; };
});

describe('ProfileUser Component', () => {
    const mockUser = { id: 'user123', name: 'John Doe', email: 'john@test.com' };
    const mockOrders = [{ id: 'order123', status: 'pending' }];

    // Zentrale Render-Funktion: Nutzt den Mock-Hook statt den Provider
    const renderWithAuth = (authValue = { userId: 'user123', token: 'valid-token' }) => {
        useAuth.mockReturnValue(authValue);
        return render(
            <BrowserRouter>
                <ProfileUser />
            </BrowserRouter>
        );
    };

    const setupHookMocks = (userOverrides = {}, orderOverrides = {}) => {
        require('../../api_managers/userProfileHookManager').useUserProfileManager.mockReturnValue({
            user: mockUser,
            loading: false,
            error: null,
            ...userOverrides
        });
        require('../../api_managers/useUserOrderManager').useOrderManager.mockReturnValue({
            orders: mockOrders,
            totalOrdersCount: 1,
            products: [],
            totalPages: 1,
            loading: false,
            updating: false,
            updateStatus: mockUpdateStatus,
            refetch: jest.fn(),
            ...orderOverrides
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('redirects to /login if no credentials are provided', () => {
        setupHookMocks({ loading: true }, { loading: true });
        renderWithAuth({ userId: null, token: null });
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('renders loading spinner when user or orders are loading', () => {
        setupHookMocks({ loading: true }, { loading: false });
        renderWithAuth();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('renders user profile and orders correctly after fetching', async () => {
        setupHookMocks();
        renderWithAuth();
        expect(screen.getByTestId('profile-header')).toBeInTheDocument();
        expect(screen.getByText('your_orders')).toBeInTheDocument();
        expect(screen.getByTestId('order-card')).toBeInTheDocument();
        expect(screen.getByText(/1.*orders/)).toBeInTheDocument();
    });

    test('shows placeholder when no orders are available', () => {
        setupHookMocks({}, { orders: [], totalOrdersCount: 0 });
        renderWithAuth();
        expect(screen.getByText('no_orders_yet')).toBeInTheDocument();
    });

    test('calls handleStatusChange and shows success toast on button click', async () => {
        mockUpdateStatus.mockResolvedValueOnce({});
        setupHookMocks();
        renderWithAuth();

        const cancelButton = screen.getByText('Cancel Order');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(mockUpdateStatus).toHaveBeenCalledWith({
                orderId: 'order123',
                newStatus: 'cancelled'
            });
        });

        const { toast } = require('react-toastify');
        expect(toast.success).toHaveBeenCalledWith('statusUpdated', expect.any(Object));
    });

    test('shows error toast when status update fails', async () => {
        const errorMessage = "updateFailed";
        mockUpdateStatus.mockRejectedValueOnce(new Error(errorMessage));
        setupHookMocks();
        renderWithAuth();

        fireEvent.click(screen.getByText('Cancel Order'));

        await waitFor(() => {
            const { toast } = require('react-toastify');
            expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
        });
    });

    test('shows loading spinner during mutation (updating state)', () => {
        setupHookMocks({}, { updating: true });
        renderWithAuth();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
});