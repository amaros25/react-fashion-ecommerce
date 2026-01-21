import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageSelectUpload from '../image_select_upload';

// Mock translation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// Mock URL.createObjectURL for JSDOM
if (typeof window.URL.createObjectURL === 'undefined') {
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
}

describe('ImageSelectUpload Component', () => {
    const mockOnImageChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders initial dropzone state correctly', () => {
        render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={3} />);
        expect(screen.getByText('choose_files')).toBeInTheDocument();
        expect(screen.getByText('alter_max_images')).toBeInTheDocument();
    });

    test('allows selecting images and displays previews', async () => {
        const { container } = render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={3} />);

        const input = container.querySelector('input[type="file"]');
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnImageChange).toHaveBeenCalledWith([file]);
        });

        const preview = await screen.findByAltText('preview-0');
        expect(preview).toBeInTheDocument();
    });

    test('prevents uploading more than maximages', async () => {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });
        const { container, rerender } = render(
            <ImageSelectUpload onImageChange={mockOnImageChange} maximages={1} />
        );

        const input = container.querySelector('input[type="file"]');
        const file1 = new File(['img1'], 'img1.png', { type: 'image/png' });
        const file2 = new File(['img2'], 'img2.png', { type: 'image/png' });

        // Step 1: Upload first file
        fireEvent.change(input, { target: { files: [file1] } });

        await waitFor(() => {
            expect(mockOnImageChange).toHaveBeenCalledWith([file1]);
        });

        // Re-render with the internal state conceptually updated (or just trigger next change)
        // Since the component keeps track of selectedImages internally:
        fireEvent.change(input, { target: { files: [file2] } });

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith('alter_max_images');
        });

        alertMock.mockRestore();
    });

    test('removes image when delete button is clicked', async () => {
        const { container } = render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={3} />);

        const input = container.querySelector('input[type="file"]');
        const file = new File(['test'], 'test.png', { type: 'image/png' });

        fireEvent.change(input, { target: { files: [file] } });

        const deleteBtn = await screen.findByText('X');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockOnImageChange).toHaveBeenLastCalledWith([]);
        });
        expect(screen.queryByAltText('preview-0')).not.toBeInTheDocument();
    });

    test('shows maximum images warning when limit is reached (maximages=3)', async () => {
        const { container } = render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={3} />);

        const input = container.querySelector('input[type="file"]');
        const files = [
            new File(['1'], '1.png', { type: 'image/png' }),
            new File(['2'], '2.png', { type: 'image/png' }),
            new File(['3'], '3.png', { type: 'image/png' })
        ];

        fireEvent.change(input, { target: { files: files } });

        const maxMessage = await screen.findByText('max_images_selected');
        expect(maxMessage).toBeInTheDocument();
    });

    test('applies "single-preview" class when maximages is 1', () => {
        const { container } = render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={1} />);
        const previewDiv = container.querySelector('.image-preview');
        expect(previewDiv).toHaveClass('single-preview');
    });
});