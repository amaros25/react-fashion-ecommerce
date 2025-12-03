import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ShopPage from '../ShopPage';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));

describe('ShopPage Component', () => {
    test('renders shop page', () => {
        render(
            <BrowserRouter>
                <ShopPage />
            </BrowserRouter>
        );

        expect(screen.getByText(/shop/i)).toBeInTheDocument();
    });
});
