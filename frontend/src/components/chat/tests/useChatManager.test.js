// Jest test for debounced read status handling in useChatManager
import { renderHook } from '@testing-library/react';
import { useChatManager } from '../api_managers/useChatManager';

// Mock the dependent hooks
jest.mock('../api_hooks/chat_hooks', () => ({
    useUserChats: jest.fn(() => ({ data: { chats: [] }, isLoading: false })),
    useChatMessages: jest.fn(() => ({ data: null, isLoading: false })),
    useSendMessage: jest.fn(() => ({ mutateAsync: jest.fn() })),
    useCreateChat: jest.fn(() => ({ mutateAsync: jest.fn() })),
    useUpdateReadStatus: jest.fn(() => ({ mutate: jest.fn() })),
}));

jest.useFakeTimers();

describe('useChatManager debounced read status', () => {
    it('should batch multiple read status calls into a single mutation', async () => {
        const mockMutate = jest.fn();
        const { useUpdateReadStatus } = require('../api_hooks/chat_hooks');
        useUpdateReadStatus.mockReturnValue({ mutate: mockMutate });

        const { result } = renderHook(() =>
            useChatManager('user2', 'token123', null, null, null, null, null, null)
        );

        // Call handleMarkAsRead multiple times quickly
        act(() => {
            result.current.handleMarkAsRead([1]);
            result.current.handleMarkAsRead([2, 3]);
        });

        // Fast-forward debounce timer
        jest.advanceTimersByTime(600);

        expect(mockMutate).toHaveBeenCalledTimes(1);
        const callArg = mockMutate.mock.calls[0][0];
        expect(callArg.messageIds.sort()).toEqual([1, 2, 3]);
    });
});
