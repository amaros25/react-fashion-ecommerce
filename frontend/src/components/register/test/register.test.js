import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Register from '../register';
import { toast } from 'react-toastify';

// Mock Hooks and Dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            language: 'en',
            dir: () => 'ltr'
        }
    })
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn()
    }
}));

// Mock custom hooks if necessary, or let them run if they don't have side effects we can't control.
// `useRegisterApi` makes fetch calls. We should probably mock it or mock global.fetch.
// Let's mock global.fetch to treat the component as an integration test unit.

describe('Register Component', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        mockNavigate.mockClear();
        jest.clearAllMocks();
    });

    // 1. Render Check
    test('renders register form elements', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        expect(screen.getByText('register.title')).toBeInTheDocument();
        expect(screen.getByText('register.shoper')).toBeInTheDocument();
        expect(screen.getByText('register.seller')).toBeInTheDocument();

        // Check for inputs by label text (approximate matching)
        expect(screen.getByText('register.firstName')).toBeInTheDocument();
        expect(screen.getByText('register.email')).toBeInTheDocument();
        expect(screen.getByText('register.password')).toBeInTheDocument();
        expect(screen.getByText('register.confirmPassword')).toBeInTheDocument();
    });

    // 2. Role Switching
    test('switches roles and updates form fields', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        // Default is shoper
        expect(screen.queryByText('register.shopName')).not.toBeInTheDocument();

        // Click Seller
        const sellerBtn = screen.getByText('register.seller');
        fireEvent.click(sellerBtn);

        // Should see shop name input
        expect(screen.getByText('register.shopName')).toBeInTheDocument();

        // Click Shoper back
        const shoperBtn = screen.getByText('register.shoper');
        fireEvent.click(shoperBtn);

        expect(screen.queryByText('register.shopName')).not.toBeInTheDocument();
    });

    // 3. Validation Logic - Password Mismatch
    test('shows error when passwords do not match', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        // Fill required fields to pass other validations (simplified)
        // Actually, we can just trigger submit and expect the specific error if we fill just passwords? 
        // ValidateRegisterForm checks order: First Name -> Last Name -> Email -> Password -> Confirm.
        // So we need to fill previous ones to reach password check usually, or the validation returns the *first* error.
        // Let's check if we can trigger mismatch error directly or if we get "First Name Required" first.

        // We need to fill everything to test password mismatch specifically if validation stops at first error.

        const inputs = screen.getAllByTagName('input');
        // Identifying inputs by index is brittle, let's try to be smarter or just use fireEvent on named inputs if they have names.
        // register.js inputs have name attributes!

        const changeInput = (name, value) => {
            const input = document.querySelector(`input[name="${name}"]`);
            if (input) fireEvent.change(input, { target: { value } });
        };

        changeInput('firstName', 'John');
        changeInput('lastName', 'Doe');
        changeInput('email', 'john@example.com');
        changeInput('phone', '12345678');
        changeInput('address', '123 St');

        // City selection (Select)
        const citySelect = document.querySelector('select[name="city"]');
        fireEvent.change(citySelect, { target: { value: 'Tunis' } }); // Assuming Tunis is in the list

        // SubCity
        const subCitySelect = document.querySelector('select[name="subCity"]');
        // We need to wait for state update? It's synchronous usually.
        fireEvent.change(subCitySelect, { target: { value: 'Tunis' } });

        changeInput('password', 'Password123!');
        changeInput('confirmPassword', 'Different123!');

        // Checkbox terms
        const termsCheckbox = document.querySelector('input[type="checkbox"]');
        fireEvent.click(termsCheckbox);

        const submitBtn = screen.getByText('register.submit');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('register.error.passwordMismatch');
        });
    });

    // 4. Successful Registration
    test('submits form successfully', async () => {
        // Mock successful API response
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, userId: 'user123' })
        });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        const changeInput = (name, value) => {
            const input = document.querySelector(`input[name="${name}"]`);
            if (input) fireEvent.change(input, { target: { value } });
        };

        changeInput('firstName', 'Jane');
        changeInput('lastName', 'Doe');
        changeInput('email', 'jane@example.com');
        changeInput('phone', '12345678');
        changeInput('address', '123 St');
        changeInput('password', 'Password123!');
        changeInput('confirmPassword', 'Password123!');

        const citySelect = document.querySelector('select[name="city"]');
        fireEvent.change(citySelect, { target: { value: 'Tunis' } });

        const subCitySelect = document.querySelector('select[name="subCity"]');
        fireEvent.change(subCitySelect, { target: { value: 'Tunis' } });

        const termsCheckbox = document.querySelector('input[type="checkbox"]');
        fireEvent.click(termsCheckbox);

        const submitBtn = screen.getByText('register.submit');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            // Check if toast success was called
            expect(toast.success).toHaveBeenCalledWith('register.user_created_successfully');
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });
});
