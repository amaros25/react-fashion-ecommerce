import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../home'; // Adjust path if needed
import { FilterContext } from '../../filter_context/filter_context';
import { useHomeProducts } from '../hooks/useHomeProducts';
import { MemoryRouter } from 'react-router-dom';

// Mock Dependencies
jest.mock('../hooks/useHomeProducts');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en', changeLanguage: jest.fn() },
    }),
}));
jest.mock('../../product_card/product_card', () => ({
    __esModule: true,
    default: ({ product }) => <div data-testid="product-card">{product.name}</div>
}));
jest.mock('../../loading/loading_spinner', () => ({
    __esModule: true,
    default: () => <div data-testid="loading-spinner">Loading...</div>
}));
jest.mock('../pagination', () => ({
    __esModule: true,
    default: () => <div data-testid="pagination">Pagination</div>
}));

describe('Home Component', () => {
    const mockFilterContext = {
        searchTerm: '',
        sortBy: '',
    };

    const renderHome = () => {
        return render(
            <MemoryRouter>
                <FilterContext.Provider value={mockFilterContext}>
                    <Home />
                </FilterContext.Provider>
            </MemoryRouter>
        );
    };

    it('renders loading spinner initially', () => {
        useHomeProducts.mockReturnValue({
            latestProducts: [],
            totalPages: 0,
            readingDataDone: false,
            readingError: false
        });

        renderHome();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders products when data is fetched', () => {
        useHomeProducts.mockReturnValue({
            latestProducts: [
                { _id: '1', name: 'Product 1' },
                { _id: '2', name: 'Product 2' }
            ],
            totalPages: 1,
            readingDataDone: true,
            readingError: false
        });

        renderHome();

        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        expect(screen.getAllByTestId('product-card')).toHaveLength(2);
        expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    it('renders error message on fetch error', async () => {
        useHomeProducts.mockReturnValue({
            latestProducts: [],
            totalPages: 0,
            readingDataDone: true,
            readingError: true
        });

        renderHome();

        await waitFor(() => {
            expect(screen.getByText('home_error.error_while_reading_data')).toBeInTheDocument();
        });
    });

    it('renders "no products" message when list is empty', async () => {
        useHomeProducts.mockReturnValue({
            latestProducts: [],
            totalPages: 0,
            readingDataDone: true,
            readingError: false
        });

        renderHome();

        await waitFor(() => {
            expect(screen.getByText('home_error.noProducts')).toBeInTheDocument();
        });
    });
});
