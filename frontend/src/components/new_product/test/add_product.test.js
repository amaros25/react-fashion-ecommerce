import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AddProduct from '../add_product';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';

// 1. Mock the API Manager
const mockAddProduct = jest.fn();
jest.mock('../../api_managers/useSellerProductAddManager', () => ({
    useSellerProductAddManager: () => ({
        addProduct: mockAddProduct,
        isSubmitting: { visible: false, loading: false },
    }),
}));

// 2. Mock Internationalization
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' },
    }),
}));

// 3. Mock Navigation
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
}));

// 4. Mock Toast Notifications
jest.mock('react-toastify', () => ({
    toast: { error: jest.fn() },
}));

// 5. Mock Image Upload component
jest.mock('../image_select_upload', () => ({ onImageChange }) => (
    <div data-testid="mock-image-upload">
        <button type="button" onClick={() => onImageChange([new File([''], 'test.png', { type: 'image/png' })])}>
            Simulate Image Add
        </button>
    </div>
));

describe('AddProduct Component', () => {
    const defaultProps = { sellerId: '123', token: 'abc' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all main form sections', () => {
        render(<AddProduct {...defaultProps} />);
        expect(screen.getByRole('heading', { name: 'post_product' })).toBeInTheDocument();
        expect(screen.getByText('basic_information')).toBeInTheDocument();
    });

    test('shows validation error for empty form', async () => {
        render(<AddProduct {...defaultProps} />);
        const submitBtn = screen.getByRole('button', { name: 'post_product' });
        await userEvent.click(submitBtn);
        expect(toast.error).toHaveBeenCalledWith('add_product_error.productImagesRequired');
    });

    test('successfully submits valid form with Select logic', async () => {
        mockAddProduct.mockResolvedValue({ success: true });
        render(<AddProduct {...defaultProps} />);

        // 1. Fill basic data
        await userEvent.click(screen.getByText('Simulate Image Add'));
        await userEvent.type(screen.getByPlaceholderText('example_product_name'), 'Test Product');

        const priceInput = document.querySelector('input[name="price"]');
        const shipmentInput = document.querySelector('input[name="shipment_price"]');
        await userEvent.type(priceInput, '50');
        await userEvent.type(shipmentInput, '10');
        await userEvent.type(screen.getByPlaceholderText('describe_your_product'), 'Description');

        // 2. Select Category (using name attribute for stability)
        const catSelect = document.querySelector('select[name="category"]');
        await userEvent.selectOptions(catSelect, '0');

        // 3. Select Subcategory (wait for it to appear)
        await waitFor(() => {
            const subSelect = document.querySelector('select[name="subcategory"]');
            expect(subSelect).toBeInTheDocument();
        });
        const subSelect = document.querySelector('select[name="subcategory"]');
        await userEvent.selectOptions(subSelect, '0');

        // 4. Select Size (M)
        const sizeSelect = document.querySelector('.variant-row select');
        await userEvent.selectOptions(sizeSelect, 'M');

        // 5. Submit
        const submitBtn = screen.getByRole('button', { name: 'post_product' });
        await userEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockAddProduct).toHaveBeenCalledTimes(1);
        });
    });

    test('handles variant addition and removal', async () => {
        render(<AddProduct {...defaultProps} />);

        const addVarBtn = document.querySelector('.add-variant-btn');
        await userEvent.click(addVarBtn);

        await waitFor(() => {
            const variantRows = document.querySelectorAll('.variant-row');
            expect(variantRows.length).toBe(2);
        });

        const removeBtns = document.querySelectorAll('.remove-variant-btn');
        await userEvent.click(removeBtns[0]);

        await waitFor(() => {
            const variantRows = document.querySelectorAll('.variant-row');
            expect(variantRows.length).toBe(1);
        });
    });

    test('verifies custom size input logic', async () => {
        render(<AddProduct {...defaultProps} />);

        // Find the size dropdown inside the variant row
        const sizeSelect = document.querySelector('.variant-row select');
        await userEvent.selectOptions(sizeSelect, 'custom_size');

        // Wait for custom size input to appear
        const customInput = await screen.findByPlaceholderText('enter_custom_size');
        expect(customInput).toBeInTheDocument();

        await userEvent.type(customInput, 'Ultra Wide');
        expect(customInput.value).toBe('Ultra Wide');
    });

    test('resets form after successful submission', async () => {
        mockAddProduct.mockResolvedValue({ success: true });
        render(<AddProduct {...defaultProps} />);

        // 1. Fill out all required fields
        await userEvent.click(screen.getByText('Simulate Image Add'));
        const nameInput = screen.getByPlaceholderText('example_product_name');
        await userEvent.type(nameInput, 'Reset Test Product');

        const priceInput = document.querySelector('input[name="price"]');
        const shipmentInput = document.querySelector('input[name="shipment_price"]');
        await userEvent.type(priceInput, '50');
        await userEvent.type(shipmentInput, '10');
        await userEvent.type(screen.getByPlaceholderText('describe_your_product'), 'Description');

        // Select Category and Subcategory
        const catSelect = document.querySelector('select[name="category"]');
        await userEvent.selectOptions(catSelect, '0');

        await waitFor(() => expect(document.querySelector('select[name="subcategory"]')).toBeInTheDocument());
        const subSelect = document.querySelector('select[name="subcategory"]');
        await userEvent.selectOptions(subSelect, '0');

        // Select Size
        const sizeSelect = document.querySelector('.variant-row select');
        await userEvent.selectOptions(sizeSelect, 'M');

        // 2. Submit
        const submitBtn = screen.getByRole('button', { name: 'post_product' });
        await userEvent.click(submitBtn);

        // 3. Verification
        await waitFor(() => {
            expect(mockAddProduct).toHaveBeenCalled();
            expect(nameInput.value).toBe(''); // Form reset
        });
    });
    test('switches size select to text input when "home" category is selected', async () => {
        render(<AddProduct {...defaultProps} />);

        const catSelect = document.querySelector('select[name="category"]');
        // Index 3 ist "home"
        await userEvent.selectOptions(catSelect, '3');

        // Das Dropdown sollte weg sein, dafür ein Text-Input mit dem spezifischen Placeholder
        const homeSizeInput = screen.getByPlaceholderText('exp_100_watt_30_cm');
        expect(homeSizeInput).toBeInTheDocument();
        expect(homeSizeInput.tagName).toBe('INPUT');
    });

    test('sets all sizes to "OS" and disables select when Standard Size is checked', async () => {
        render(<AddProduct {...defaultProps} />);

        // 1. Checkbox finden
        const checkbox = screen.getByRole('checkbox', { name: /Standard Size/i });

        // 2. Klick ausführen
        await userEvent.click(checkbox);

        // 3. Warten und prüfen
        await waitFor(() => {
            const sizeSelect = document.querySelector('.variant-row select');

            // Prüfen, ob die Option "OS" im DOM existiert (React fügt sie durch dein Map-Statement hinzu)
            // Falls "OS" nicht in deiner sizesList ist, rendert React sie als selektierten Wert, 
            // sofern die Logik 'size: isStandard ? "OS" : ""' greift.
            expect(sizeSelect).toBeDisabled();
            expect(sizeSelect.value).toBe('OS');
        }, { timeout: 2000 });
    });

    test('shows error if custom size is selected but text field is empty', async () => {
        render(<AddProduct {...defaultProps} />);

        // 1. Alle Pflichtfelder ausfüllen
        await userEvent.click(screen.getByText('Simulate Image Add'));
        await userEvent.type(screen.getByPlaceholderText('example_product_name'), 'Test');
        await userEvent.type(document.querySelector('input[name="price"]'), '10');
        await userEvent.type(document.querySelector('input[name="shipment_price"]'), '5');
        await userEvent.type(screen.getByPlaceholderText('describe_your_product'), 'Desc');

        // 2. Kategorie wählen
        const catSelect = document.querySelector('select[name="category"]');
        await userEvent.selectOptions(catSelect, '0');

        // 3. WICHTIG: Subkategorie ebenfalls wählen (sonst kommt der Category-Error)
        await waitFor(() => {
            const subSelect = document.querySelector('select[name="subcategory"]');
            expect(subSelect).toBeInTheDocument();
        });
        const subSelect = document.querySelector('select[name="subcategory"]');
        await userEvent.selectOptions(subSelect, '0');

        // 4. Custom Size wählen, aber das Textfeld leer lassen
        const sizeSelect = document.querySelector('.variant-row select');
        await userEvent.selectOptions(sizeSelect, 'custom_size');

        // 5. Submit
        const submitBtn = screen.getByRole('button', { name: 'post_product' });
        await userEvent.click(submitBtn);

        // Jetzt sollte er die Subcategory-Hürde nehmen und beim Custom Size Check landen
        expect(toast.error).toHaveBeenCalledWith('add_product_error.productCustomSizeRequired');
    });

    test('does not reset form if API submission fails', async () => {
        mockAddProduct.mockResolvedValue({ success: false });

        render(<AddProduct {...defaultProps} />);

        // 1. Alle Pflichtfelder ausfüllen, damit wir die Validierung bestehen
        await userEvent.click(screen.getByText('Simulate Image Add'));
        const nameInput = screen.getByPlaceholderText('example_product_name');
        await userEvent.type(nameInput, 'Stay Here');

        await userEvent.type(document.querySelector('input[name="price"]'), '10');
        await userEvent.type(document.querySelector('input[name="shipment_price"]'), '5');
        await userEvent.type(screen.getByPlaceholderText('describe_your_product'), 'Desc');

        const catSelect = document.querySelector('select[name="category"]');
        await userEvent.selectOptions(catSelect, '0');

        // Subcategory abwarten und wählen
        await waitFor(() => expect(document.querySelector('select[name="subcategory"]')).toBeInTheDocument());
        await userEvent.selectOptions(document.querySelector('select[name="subcategory"]'), '0');

        const sizeSelect = document.querySelector('.variant-row select');
        await userEvent.selectOptions(sizeSelect, 'M');

        // 2. Submit
        const submitBtn = screen.getByRole('button', { name: 'post_product' });
        await userEvent.click(submitBtn);

        // 3. Verifizieren, dass API aufgerufen wurde, aber der Input NICHT leer ist
        await waitFor(() => {
            expect(mockAddProduct).toHaveBeenCalled();
        });

        expect(nameInput.value).toBe('Stay Here'); // Bleibt erhalten bei success: false
    });
});