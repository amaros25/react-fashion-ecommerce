import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageSelectUpload from '../image_select_upload';
import userEvent from '@testing-library/user-event';

// Mock translation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('ImageSelectUpload Component', () => {
    const mockOnImageChange = jest.fn();

    beforeEach(() => {
        mockOnImageChange.mockClear();
        global.URL.createObjectURL.mockClear();
    });

    test('renders dropzone instructions', () => {
        render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={5} />);
        expect(screen.getByText('choose_files')).toBeInTheDocument();
    });

    test('calls onImageChange when files are selected', async () => {
        render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={5} />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const fileInput = document.querySelector('input[type="file"]');

        await userEvent.upload(fileInput, file);

        expect(mockOnImageChange).toHaveBeenCalledTimes(1);
        expect(mockOnImageChange).toHaveBeenCalledWith(expect.arrayContaining([file]));
    });

    test('displays previews for selected files', async () => {
        render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={5} />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const fileInput = document.querySelector('input[type="file"]');

        await userEvent.upload(fileInput, file);

        expect(await screen.findByAltText('preview-0')).toBeInTheDocument();
    });

    test('removes image when delete button is clicked', async () => {
        render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={5} />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const fileInput = document.querySelector('input[type="file"]');
        await userEvent.upload(fileInput, file);

        const deleteBtn = await screen.findByText('X');
        fireEvent.click(deleteBtn);

        expect(screen.queryByAltText('preview-0')).not.toBeInTheDocument();
        expect(mockOnImageChange).toHaveBeenCalledWith([]);
    });

    test('shows alert when max images limit is exceeded', async () => {
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });

        // We restart the render to have a fresh state
        render(<ImageSelectUpload onImageChange={mockOnImageChange} maximages={2} />);
        const fileInput = document.querySelector('input[type="file"]');

        // 1. Upload 2 files (Allowed)
        const file1 = new File(['one'], 'one.png', { type: 'image/png' });
        const file2 = new File(['two'], 'two.png', { type: 'image/png' });
        await userEvent.upload(fileInput, [file1, file2]);

        // Expect no alert yet
        expect(alertMock).not.toHaveBeenCalled();
        expect(mockOnImageChange).toHaveBeenCalledTimes(1);

        // 2. Upload 1 more file (Should trigger alert)
        const file3 = new File(['three'], 'three.png', { type: 'image/png' });
        await userEvent.upload(fileInput, [file3]);

        // Component logic: checks total > maximages
        // 2 (existing) + 1 (new) = 3 > 2 => Alert
        expect(alertMock).toHaveBeenCalledWith('alter_max_images');

        // Should NOT have triggered onChange for the second upload because it returns early
        expect(mockOnImageChange).toHaveBeenCalledTimes(1);

        alertMock.mockRestore();
    });
});
