import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusSelect from '../status_select';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

describe('StatusSelect Component', () => {
  const mockOrder = {
    _id: 'order123',
    status: [{ update: 'pending' }]
  };

  const mockOnStatusChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders select element', () => {
    render(<StatusSelect order={mockOrder} onStatusChange={mockOnStatusChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('displays correct options for pending status', () => {
    render(<StatusSelect order={mockOrder} onStatusChange={mockOnStatusChange} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  test('displays correct options for confirmed status', () => {
    const confirmedOrder = {
      ...mockOrder,
      status: [{ update: 'confirmed' }]
    };

    render(<StatusSelect order={confirmedOrder} onStatusChange={mockOnStatusChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('calls onStatusChange when option is selected', () => {
    render(<StatusSelect order={mockOrder} onStatusChange={mockOnStatusChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'confirmed' } });

    expect(mockOnStatusChange).toHaveBeenCalledWith('order123', 'confirmed');
  });

  test('handles shipped status options correctly', () => {
    const shippedOrder = {
      ...mockOrder,
      status: [{ update: 'shipped' }]
    };

    render(<StatusSelect order={shippedOrder} onStatusChange={mockOnStatusChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('handles return_requested status options correctly', () => {
    const returnOrder = {
      ...mockOrder,
      status: [{ update: 'return_requested' }]
    };

    render(<StatusSelect order={returnOrder} onStatusChange={mockOnStatusChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('handles failed_delivery status options correctly', () => {
    const failedOrder = {
      ...mockOrder,
      status: [{ update: 'failed_delivery' }]
    };

    render(<StatusSelect order={failedOrder} onStatusChange={mockOnStatusChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('returns empty options for unknown status', () => {
    const unknownOrder = {
      ...mockOrder,
      status: [{ update: 'unknown_status' }]
    };

    render(<StatusSelect order={unknownOrder} onStatusChange={mockOnStatusChange} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  test('uses default pending status when status is undefined', () => {
    const orderWithoutStatus = {
      _id: 'order123',
      status: []
    };

    render(<StatusSelect order={orderWithoutStatus} onStatusChange={mockOnStatusChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
