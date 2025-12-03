import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from '../login';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
}));

describe('Login Component', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        localStorage.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders login form', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByText('login')).toBeInTheDocument();
    });

    test('handles form submission', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'test-token', userId: 'user123' })
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        const submitButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });
});
