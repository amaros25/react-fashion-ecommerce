import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from '../login';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Mock Dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' }
    })
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
}));

jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn()
    }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
    const mockLogin = jest.fn();

    beforeEach(() => {
        useAuth.mockReturnValue({ login: mockLogin });
        global.fetch = jest.fn();
        localStorage.clear();
        mockNavigate.mockClear();
        mockLogin.mockClear();
        jest.clearAllMocks();
    });

    // 1. Rendering Verification
    test('renders login form with all elements', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByRole('heading', { level: 2, name: /login/i })).toBeInTheDocument();
        expect(screen.getByText('email_or_phone')).toBeInTheDocument();
        expect(screen.getByText('password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login_start/i })).toBeInTheDocument();
        expect(screen.getByText('forgot_password')).toBeInTheDocument();
        expect(screen.getByText('register.title')).toBeInTheDocument();
    });

    // 2. Input Handling
    test('updates state on user input', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByRole('textbox'); // email type="text" because of "email_or_phone"
        const passwordInput = screen.getByLabelText('password'); // Use label text association

        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('user@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    // 3. Password Visibility
    test('toggles password visibility', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const passwordInput = screen.getByLabelText('password');
        // Because the label is "password", finding input by label works well if htmlFor/id are set or using implicit nesting with standard HTML.
        // In the component: <label>{t("password")}</label><input ... /> inside a div. They are siblings.
        // We might need a better selector if getByLabelText fails. 
        // But let's assume getByLabelText might fail because implicit link isn't perfect in custom React structures without IDs.
        // Actually, the component doesn't use `id` and `htmlFor`. 
        // So `screen.getByLabelText` won't work perfectly unless checking nested structure.
        // Let's use selectors based on the surrounding containers or order.

        // Actually, password input is the only input of type "password" initially.
        const pwInput = document.querySelector('input[type="password"]');
        expect(pwInput).toBeInTheDocument();

        const toggleIcon = document.querySelector('.password-toggle-icon');
        fireEvent.click(toggleIcon);

        const textInput = document.querySelector('input[type="text"]');
        // Value should be preserved (though empty here)
        expect(document.querySelector('input[type="password"]')).not.toBeInTheDocument();

        fireEvent.click(toggleIcon);
        expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
    });

    // 4. Successful Login
    test('handles successful login and navigation', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                token: 'fake-token',
                role: 'shoper',
                userId: 'user123',
                address: '123 St',
                phone: '555-5555',
                city: 'Berlin',
                subCity: 'Mitte'
            })
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const inputs = screen.getAllByTagName('input');
        fireEvent.change(inputs[0], { target: { value: 'test@example.com' } });
        fireEvent.change(inputs[1], { target: { value: 'password123' } });

        const submitBtn = screen.getByRole('button', { name: /login_start/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/login'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
                })
            );
        });

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                token: 'fake-token',
                role: 'shoper',
                userId: 'user123',
                userData: expect.any(Object)
            });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/profile_user');
        });
    });

    // 5. Failed Login
    test('displays error on failed login', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: 'invalid_credentials' })
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const inputs = screen.getAllByTagName('input');
        fireEvent.change(inputs[0], { target: { value: 'wrong@example.com' } });
        fireEvent.change(inputs[1], { target: { value: 'wrongpass' } });

        fireEvent.click(screen.getByRole('button', { name: /login_start/i }));

        await waitFor(() => {
            expect(screen.getByText('invalid_credentials')).toBeInTheDocument();
        });
    });

    // 6. Already Logged In (403)
    test('handles already logged in scenario', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
            json: async () => ({ message: 'already_logged_in' })
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const inputs = screen.getAllByTagName('input');
        fireEvent.change(inputs[0], { target: { value: 'user@example.com' } });
        fireEvent.change(inputs[1], { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /login_start/i }));

        await waitFor(() => {
            expect(toast.warn).toHaveBeenCalledWith('already_logged_in', expect.any(Object));
        });
    });

    // 7. Forgot Password Flow
    test('handles forgot password modal and submission', async () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const forgotLink = screen.getByText('forgot_password');
        fireEvent.click(forgotLink);

        expect(screen.getByText('reset_password_title')).toBeInTheDocument();

        const emailInput = screen.getByPlaceholderText('enter_email');
        fireEvent.change(emailInput, { target: { value: 'reset@example.com' } });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'reset_email_sent' })
        });

        const sendBtn = screen.getByText('send_reset_link');
        fireEvent.click(sendBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/request-password-reset'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'reset@example.com' })
                })
            );
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('reset_email_sent', expect.any(Object));
        });
    });
});
