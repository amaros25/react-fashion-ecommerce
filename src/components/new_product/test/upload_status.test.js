import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import UploadStatus from '../upload_status';

// Mock translation to return the key as the translated text
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

describe('UploadStatus Component - Comprehensive Tests', () => {

    // Use fake timers to handle setTimeout logic
    beforeEach(() => {
        jest.useFakeTimers();
    });

    // Cleanup timers and wrap in act to handle state updates during cleanup
    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    test('does not render when status.visible is false', () => {
        const status = { visible: false, loading: false, success: false, error: false };
        const { container } = render(<UploadStatus status={status} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders loading state with spinner and text', () => {
        const status = { visible: true, loading: true, success: false, error: false };
        render(<UploadStatus status={status} />);
        expect(screen.getByText('upload_status.loading')).toBeInTheDocument();
        expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    test('renders success state with icon', () => {
        const status = { visible: true, loading: false, success: true, error: false };
        render(<UploadStatus status={status} />);
        expect(screen.getByText('upload_status.success')).toBeInTheDocument();
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    test('renders error state with fallback or custom errorKey', () => {
        const statusWithCustomKey = {
            visible: true,
            loading: false,
            success: false,
            error: true,
            errorKey: 'custom_api_error'
        };
        render(<UploadStatus status={statusWithCustomKey} />);
        expect(screen.getByText('custom_api_error')).toBeInTheDocument();
    });

    test('auto-hides the component after 3 seconds on success', () => {
        const status = { visible: true, loading: false, success: true, error: false };
        const { container } = render(<UploadStatus status={status} />);

        expect(screen.getByText('upload_status.success')).toBeInTheDocument();

        // Advance timers inside act to handle internal state change
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(container.firstChild).toBeNull();
    });

    test('prevents closing while loading but allows it on success/error', () => {
        const { rerender } = render(<UploadStatus status={{ visible: true, loading: true }} />);
        expect(document.querySelector('.close-status-btn')).not.toBeInTheDocument();

        // Trigger rerender for success
        act(() => {
            rerender(<UploadStatus status={{ visible: true, loading: false, success: true }} />);
        });

        const closeBtn = document.querySelector('.close-status-btn');
        expect(closeBtn).toBeInTheDocument();

        // Manual click should hide it
        act(() => {
            fireEvent.click(closeBtn);
        });
        expect(screen.queryByText('upload_status.success')).not.toBeInTheDocument();
    });

    test('resets visibility when status.visible transitions from false to true', async () => {
        // 1. Initial render (Visible)
        const { rerender } = render(<UploadStatus status={{ visible: true, success: true, loading: false }} />);

        // 2. Close manually (Sets internal visible to false)
        const closeBtn = document.querySelector('.close-status-btn');
        act(() => {
            fireEvent.click(closeBtn);
        });
        expect(screen.queryByText('upload_status.success')).not.toBeInTheDocument();

        // 3. Simulating a new upload by changing 'visible' from false to true
        // First set it to false so the component "sees" a transition
        act(() => {
            rerender(<UploadStatus status={{ visible: false }} />);
        });

        // Now set it to true again with loading state
        act(() => {
            rerender(<UploadStatus status={{ visible: true, loading: true }} />);
        });

        // Use findBy instead of getBy to allow React a moment to process the effect
        const loadingText = await screen.findByText('upload_status.loading');
        expect(loadingText).toBeInTheDocument();
    });
});