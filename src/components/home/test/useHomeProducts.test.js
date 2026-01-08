import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useHomeProducts } from '../hooks/useHomeProducts';
import { FilterContext } from '../../filter_context/filter_context';

// Mock Fetch
global.fetch = jest.fn();

describe('useHomeProducts Hook', () => {
    const mockContextValue = {
        cachedHomeProducts: [],
        setCachedHomeProducts: jest.fn(),
        cachedTotalPages: 0,
        setCachedTotalPages: jest.fn(),
        cacheParams: {},
        setCacheParams: jest.fn(),
    };

    const wrapper = ({ children }) => (
        <FilterContext.Provider value={mockContextValue}>
            {children}
        </FilterContext.Provider>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches products successfully', async () => {
        const mockData = {
            products: [{ _id: '1', name: 'Product 1' }],
            totalPages: 1,
            totalItems: 1
        };

        fetch.mockResolvedValueOnce({
            json: async () => mockData,
        });

        const { result } = renderHook(() => useHomeProducts(1, 10, null, null, '', ''), { wrapper });

        // Initial state
        expect(result.current.readingDataDone).toBe(false);

        // Wait for update
        await waitFor(() => {
            expect(result.current.readingDataDone).toBe(true);
        });

        expect(result.current.latestProducts).toEqual(mockData.products);
        expect(result.current.totalPages).toBe(1);
    });

    it('handles cache hit', async () => {
        const cachedContext = {
            ...mockContextValue,
            cachedHomeProducts: [{ _id: '99', name: 'Cached Product' }],
            cachedTotalPages: 5,
            cacheParams: { page: 1, limit: 10, urlCategory: null, urlSubcategory: null, searchTerm: '', sortBy: '' }
        };

        const cachedWrapper = ({ children }) => (
            <FilterContext.Provider value={cachedContext}>
                {children}
            </FilterContext.Provider>
        );

        const { result } = renderHook(() => useHomeProducts(1, 10, null, null, '', ''), { wrapper: cachedWrapper });

        await waitFor(() => {
            expect(result.current.latestProducts).toHaveLength(1);
            expect(result.current.latestProducts[0].name).toBe('Cached Product');
        });

        // Fetch should NOT be called
        expect(fetch).not.toHaveBeenCalled();
    });

    it('handles fetch error', async () => {
        fetch.mockRejectedValueOnce(new Error('Fetch failed'));

        const { result } = renderHook(() => useHomeProducts(1, 10, null, null, '', ''), { wrapper });

        await waitFor(() => {
            expect(result.current.readingDataDone).toBe(true);
            expect(result.current.readingError).toBe(true);
        });
    });
});
