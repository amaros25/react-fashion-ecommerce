import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import SellerProducts from '../seller_products';

// Mock dependencies
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

jest.mock('../products/loading_spinner', () => () => <div data-testid="loading-spinner">Loading...</div>);

describe('SellerProducts Component', () => {
  const mockProducts = [
    {
      _id: 'product1',
      name: 'Test Product 1',
      price: 29.99,
      image: ['image1.jpg'],
      productNumber: 'P001',
      orderCount: 5,
      createdAt: '2024-01-01',
      states: [{ state: 1 }]
    },
    {
      _id: 'product2',
      name: 'Test Product 2',
      price: 49.99,
      image: ['image2.jpg'],
      productNumber: 'P002',
      orderCount: 0,
      createdAt: '2024-01-02',
      states: [{ state: 0 }]
    }
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
    process.env.REACT_APP_API_URL = 'http://localhost:5000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders products grid correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: mockProducts,
        totalPages: 1,
        page: 1
      })
    });

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });

  test('displays search input', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [],
        totalPages: 1,
        page: 1
      })
    });

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('search_product_by_id')).toBeInTheDocument();
  });

  test('handles search input change', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: mockProducts,
        totalPages: 1,
        page: 1
      })
    });

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('search_product_by_id');
    fireEvent.change(searchInput, { target: { value: 'P001' } });

    expect(searchInput.value).toBe('P001');
  });

  test('displays empty state when no products', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [],
        totalPages: 1,
        page: 1
      })
    });

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('no_products_found')).toBeInTheDocument();
    });
  });

  test('displays product state badges correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: mockProducts,
        totalPages: 1,
        page: 1
      })
    });

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('product_state.active')).toBeInTheDocument();
      expect(screen.getByText('product_state.pending')).toBeInTheDocument();
    });
  });

  test('displays pagination when multiple pages', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: mockProducts,
        totalPages: 3,
        page: 1
      })
    });

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      const pageButtons = screen.getAllByRole('button');
      expect(pageButtons.length).toBeGreaterThan(0);
    });
  });

  test('handles API error gracefully', async () => {
    console.error = jest.fn(); // Suppress error logs
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('no_products_found')).toBeInTheDocument();
    });
  });

  test('getStateLabel returns correct labels', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [
          { ...mockProducts[0], states: [{ state: 0 }] },
          { ...mockProducts[1], states: [{ state: 1 }] }
        ],
        totalPages: 1,
        page: 1
      })
    });

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('product_state.pending')).toBeInTheDocument();
      expect(screen.getByText('product_state.active')).toBeInTheDocument();
    });
  });

  test('displays loading spinner while fetching', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <SellerProducts sellerId="seller123" apiUrl="http://localhost:5000" token="test-token" />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
