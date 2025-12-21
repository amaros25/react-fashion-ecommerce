import { renderHook, act } from '@testing-library/react';
import { useChats } from '../use_chats';
import * as chatApi from '../chat_api';

// Mock chat_api functions
jest.mock('../chat_api');

describe('useChats', () => {
    const mockChats = [
        { _id: '1', type: 'product', number: '123', messages: [] },
        { _id: '2', type: 'order', number: '456', messages: [] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        chatApi.fetchChats.mockResolvedValue({ chats: mockChats, totalPages: 1 });
    });

    it('initializes with default values', async () => {
        const { result } = renderHook(() => useChats('user1', null, 'product', ''));

        expect(result.current.chats).toEqual([]);
        expect(result.current.activeChat).toBeNull();
        expect(result.current.isNewChat).toBe(false);
    });

    it('fetches chats on mount', async () => {
        const { result } = renderHook(() => useChats('user1', null, 'product', ''));

        // Wait for the useEffect to fetch chats
        await act(async () => {
            await Promise.resolve(); // Wait for promises to resolve
        });

        expect(chatApi.fetchChats).toHaveBeenCalled();
        expect(result.current.chats).toEqual(mockChats);
    });

    it('opens a selected chat', async () => {
        const mockChatDetails = { _id: '1', messages: [{ text: 'Hello' }] };
        chatApi.openChat.mockResolvedValue(mockChatDetails);
        chatApi.markMessagesAsRead.mockResolvedValue({});

        const { result } = renderHook(() => useChats('user1', null, 'product', ''));

        await act(async () => {
            await result.current.openSelectedChat('1');
        });

        expect(chatApi.openChat).toHaveBeenCalledWith('1', 'user1', 5);
        expect(result.current.activeChat).toEqual(mockChatDetails);
    });

    it('sends a new message in existing chat', async () => {
        const mockChatDetails = { _id: '1', messages: [] };
        const mockSentMessage = { _id: '1', messages: [{ text: 'New Msg' }] };

        chatApi.openChat.mockResolvedValue(mockChatDetails);
        chatApi.sendMessage.mockResolvedValue(mockSentMessage);

        const { result } = renderHook(() => useChats('user1', null, 'product', ''));

        // Set active chat first
        await act(async () => {
            await result.current.openSelectedChat('1');
        });

        await act(async () => {
            await result.current.sendNewMessage('New Msg');
        });

        expect(chatApi.sendMessage).toHaveBeenCalledWith('1', 'user1', 'New Msg');
        expect(result.current.activeChat).toEqual(mockSentMessage);
    });

    it('starts a new chat and sends message', async () => {
        const mockNewChat = { _id: 'new1', type: 'product', number: '999', messages: [] };
        const mockSentMessage = { _id: 'new1', messages: [{ text: 'Hello' }] };

        chatApi.startNewChat.mockResolvedValue(mockNewChat);
        chatApi.sendMessage.mockResolvedValue(mockSentMessage);

        const { result } = renderHook(() => useChats('user1', null, 'product', '999'));

        await act(async () => {
            result.current.setNewChatType('product');
            result.current.setNewChatNumber('999');
            result.current.setIsNewChat(true);
        });

        await act(async () => {
            await result.current.sendNewMessage('Hello');
        });

        expect(chatApi.startNewChat).toHaveBeenCalled();
        expect(chatApi.sendMessage).toHaveBeenCalled();
        expect(result.current.activeChat).toEqual(mockSentMessage);
    });

    it('loads older messages', async () => {
        // Create 5 messages to ensure hasMore becomes true (PAGE_LIMIT is 5)
        const messages = Array(5).fill(null).map((_, i) => ({ _id: `m${i}` }));
        const mockChatDetails = { _id: '1', messages };
        const mockOlderMessages = { messages: [{ _id: 'old1' }] };

        chatApi.openChat.mockResolvedValue(mockChatDetails);
        chatApi.loadMoreMessages.mockResolvedValue(mockOlderMessages);

        const { result } = renderHook(() => useChats('user1', null, 'product', ''));

        // Set active chat
        await act(async () => {
            await result.current.openSelectedChat('1');
        });

        await act(async () => {
            await result.current.loadOlderMessages();
        });

        expect(chatApi.loadMoreMessages).toHaveBeenCalledWith('1', 1, 5);
        // The hook appends older messages. 5 initial + 1 older = 6
        expect(result.current.activeChat.messages).toHaveLength(6);
    });

    it('handles mobile resize', () => {
        const { result } = renderHook(() => useChats('user1', null, 'product', ''));

        act(() => {
            global.innerWidth = 500;
            global.dispatchEvent(new Event('resize'));
        });

        expect(result.current.isMobile).toBe(true);

        act(() => {
            global.innerWidth = 1024;
            global.dispatchEvent(new Event('resize'));
        });

        expect(result.current.isMobile).toBe(false);
    });
});
