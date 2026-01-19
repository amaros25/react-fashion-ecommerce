import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SellerProducts from '../seller_products';
import { useSellerProductFetchManager } from '../../api_managers/useSellerProductFetchManager.js';


// 1. Mock the custom hook
jest.mock('../../api_managers/useSellerProductFetchManager.js', () => ({
  useSellerProductFetchManager: jest.fn(() => ({
    products: [],
    isLoading: false,
    handleSearch: jest.fn(),
    handlePageChange: jest.fn(),
    totalPages: 1,
    currentPage: 1,
  })),
}));

// 2. Mock Translation and Navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../utils/loading_spinner', () => {
  return function DummySpinner() {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" data-testid="loading-spinner">Loading...</div>
      </div>
    );
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' }
  }),
}));

const mockProducts = [
  {
    id: '1',
    name: 'Vintage Jacket',
    price: 50,
    orderCount: 5,
    images: ['test-image.jpg'],
    productNumber: 'VJ-001',
    createdAt: new Date().toISOString(),
    variants: [{ stock: 10 }, { stock: 5 }],
    currentState: 1 // Active
  }
];

describe('SellerProducts Component', () => {
  const defaultProps = { sellerId: 'seller123', token: 'token123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupMock = (overrides = {}) => {
    useSellerProductFetchManager.mockReturnValue({
      products: [],
      isLoading: false,
      handleSearch: jest.fn(),
      handlePageChange: jest.fn(),
      totalPages: 1,
      currentPage: 1,
      ...overrides
    });
  };

  test('shows LoadingSpinner when loading', () => {
    setupMock({ isLoading: true, products: [] });

    render(
      <BrowserRouter>
        <SellerProducts {...defaultProps} />
      </BrowserRouter>
    );

    // 3. Finden (getByTestId wirft einen Fehler mit HTML-Output, falls es fehlschlägt)
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  test('renders empty state when no products found', () => {
    setupMock({ products: [] });
    render(
      <BrowserRouter>
        <SellerProducts {...defaultProps} />
      </BrowserRouter>
    );
    expect(screen.getByText('no_products_found')).toBeInTheDocument();
  });

  test('renders products correctly', () => {
    setupMock({ products: mockProducts });
    render(
      <BrowserRouter>
        <SellerProducts {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByText('Vintage Jacket')).toBeInTheDocument();
    expect(screen.getByText('50 price_suf')).toBeInTheDocument();
    // Total stock: 10 + 5 = 15
    expect(screen.getByText('stock: 15')).toBeInTheDocument();
    expect(screen.getByText('VJ-001')).toBeInTheDocument();
  });

  test('triggers search on Enter key', () => {
    const mockHandleSearch = jest.fn();
    setupMock({ handleSearch: mockHandleSearch });

    render(
      <BrowserRouter>
        <SellerProducts {...defaultProps} />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('search_product_by_id');
    fireEvent.change(input, { target: { value: 'VJ-001' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockHandleSearch).toHaveBeenCalledWith('VJ-001');
  });

  test('navigates to product detail on card click', () => {
    setupMock({ products: mockProducts });
    render(
      <BrowserRouter>
        <SellerProducts {...defaultProps} />
      </BrowserRouter>
    );

    const card = screen.getByText('Vintage Jacket').closest('.premium-product-card');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/product/1');
  });

  test('handles pagination clicks', () => {
    const mockPageChange = jest.fn();
    setupMock({ totalPages: 3, currentPage: 1, handlePageChange: mockPageChange });

    render(
      <BrowserRouter>
        <SellerProducts {...defaultProps} />
      </BrowserRouter>
    );

    const pageTwoBtn = screen.getByText('2');
    fireEvent.click(pageTwoBtn);

    expect(mockPageChange).toHaveBeenCalledWith(2);
  });
});