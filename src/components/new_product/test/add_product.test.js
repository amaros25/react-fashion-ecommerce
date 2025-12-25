import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddProduct from '../add_product';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';

// Mocks
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' },
    }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
    },
}));

// Mock ImageSelectUpload to simplify testing image selection
jest.mock('../image_select_upload', () => ({ onImageChange }) => (
    <div data-testid="mock-image-upload">
        <button type="button" onClick={() => onImageChange([new File([''], 'test.png')])}>
            Simulate Image Add
        </button>
    </div>
));

// Mock UploadStatus
jest.mock('../upload_status', () => () => <div data-testid="mock-upload-status" />);

const mockCreateProduct = jest.fn();
jest.mock('../hooks/useProductUpload', () => ({
    useProductUpload: () => ({
        status: { visible: false },
        createProduct: mockCreateProduct,
    }),
}));

describe('AddProduct Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all main form sections', () => {
        render(<AddProduct />);
        // "post_product" appears in header and button. Check for header specifically.
        expect(screen.getByRole('heading', { name: 'post_product' })).toBeInTheDocument();

        expect(screen.getByText('basic_information')).toBeInTheDocument();
        expect(screen.getByText('category')).toBeInTheDocument();
        expect(screen.getByText('variants')).toBeInTheDocument();
    });

    test('shows validation error when submitting empty form', async () => {
        render(<AddProduct />);
        const submitBtn = screen.getByText('post_product', { selector: 'button' });

        await userEvent.click(submitBtn);

        expect(mockCreateProduct).not.toHaveBeenCalled();
        // Use toast check instead of getByText
        expect(toast.error).toHaveBeenCalledWith('add_product.error.productImagesRequired');
    });

    test('validates product name', async () => {
        render(<AddProduct />);
        // Select image first to pass first check
        await userEvent.click(screen.getByText('Simulate Image Add'));

        const submitBtn = screen.getByText('post_product', { selector: 'button' });
        await userEvent.click(submitBtn);

        expect(toast.error).toHaveBeenCalledWith('add_product.error.productNameRequired');
    });

    test('successfully submits valid form', async () => {
        mockCreateProduct.mockResolvedValue(true);
        render(<AddProduct />);

        // 1. Add Image
        await userEvent.click(screen.getByText('Simulate Image Add'));

        // 2. Fill Basic Info
        await userEvent.type(document.querySelector('input[name="name"]'), 'Test Product');
        await userEvent.type(document.querySelector('input[name="price"]'), '50');
        await userEvent.type(document.querySelector('input[name="shipment_price"]'), '10');
        await userEvent.type(document.querySelector('textarea[name="description"]'), 'A great test product');

        // 3. Select Category & Subcategory
        const catSelect = document.querySelector('select[name="category"]');
        await userEvent.selectOptions(catSelect, '0'); // "womens" is index 0

        const subSelect = document.querySelector('select[name="subcategory"]');
        await userEvent.selectOptions(subSelect, '0'); // "clothes" is index 0

        // 4. Variant (Size & Stock)
        const sizeInput = document.querySelector('input[placeholder="e.g. M, 38"]');
        const stockInput = document.querySelector('input[placeholder="1"]');

        await userEvent.type(sizeInput, 'M');

        await userEvent.clear(stockInput);
        await userEvent.type(stockInput, '5');

        // 5. Submit
        const submitBtn = screen.getByText('post_product', { selector: 'button' });
        await userEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockCreateProduct).toHaveBeenCalledTimes(1);
        });

        // Verify arguments passed to createProduct
        const [formDataArg, imageFilesArg] = mockCreateProduct.mock.calls[0];
        expect(formDataArg.name).toBe('Test Product');
        expect(formDataArg.price).toBe('50');
        expect(formDataArg.category).toBe(0); // number
        expect(imageFilesArg).toHaveLength(1);
    });

    test('handles variant addition and removal', async () => {
        render(<AddProduct />);

        const addVarBtn = screen.getByText('add_another_size');
        await userEvent.click(addVarBtn);

        const sizeInputs = document.querySelectorAll('input[placeholder="e.g. M, 38"]');
        expect(sizeInputs.length).toBe(2);

        // Remove one
        const removeBtns = document.querySelectorAll('.remove-variant-btn');
        expect(removeBtns.length).toBeGreaterThan(0);
        await userEvent.click(removeBtns[0]);

        const sizeInputsAfter = document.querySelectorAll('input[placeholder="e.g. M, 38"]');
        expect(sizeInputsAfter.length).toBe(1);
    });
});
