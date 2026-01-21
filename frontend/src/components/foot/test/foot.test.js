import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Foot from '../foot';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));

describe('Foot Component', () => {
    test('renders footer', () => {
        render(
            <BrowserRouter>
                <Foot />
            </BrowserRouter>
        );

        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
});
