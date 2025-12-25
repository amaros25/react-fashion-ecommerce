import React from 'react';
import { render, screen } from '@testing-library/react';
import UploadStatus from '../upload_status';

// Mock translation
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

describe('UploadStatus Component', () => {
    test('does not render when status.visible is false', () => {
        const status = { visible: false, loading: false, success: false, error: false };
        const { container } = render(<UploadStatus status={status} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders loading state correctly', () => {
        const status = { visible: true, loading: true, success: false, error: false };
        render(<UploadStatus status={status} />);

        // Check for spinner and text
        expect(screen.getByText('upload_status.loading')).toBeInTheDocument();
        expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    test('renders success state correctly', () => {
        const status = { visible: true, loading: false, success: true, error: false };
        render(<UploadStatus status={status} />);

        expect(screen.getByText('upload_status.success')).toBeInTheDocument();
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    test('renders error state correctly', () => {
        const status = { visible: true, loading: false, success: false, error: true };
        render(<UploadStatus status={status} />);

        expect(screen.getByText('upload_status.error')).toBeInTheDocument();
        expect(screen.getByText('❌')).toBeInTheDocument();
    });
});
