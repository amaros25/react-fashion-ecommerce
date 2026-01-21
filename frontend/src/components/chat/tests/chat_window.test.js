import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from '../chat_window';

// Mock translations
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'chat.backToChats': 'Back to Chats',
                'chat.loadOlderMessages': 'Load older messages',
                'chat.unread': 'Unread',
                'chat.read': 'Read',
                'chat.messagePlaceholder': 'Type a message...',
                'chat.sendButton': 'Send',
                'chat.noChat': 'No chat selected',
            };
            return translations[key] || key;
        },
        i18n: {
            dir: () => 'ltr',
        },
    }),
}));

describe('ChatWindow', () => {
    const mockProps = {
        activeChat: null,
        userId: 'user123',
        hasMore: false,
        loadOlderMessages: jest.fn(),
        sendNewMessage: jest.fn(),
        newMessage: '',
        setNewMessage: jest.fn(),
        isLoadingOlder: false,
        isMobile: false,
        handleBackToSidebar: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders no chat message when activeChat is null', () => {
        render(<ChatWindow {...mockProps} />);
        expect(screen.getByText('No chat selected')).toBeInTheDocument();
    });

    it('renders messages when activeChat is provided', () => {
        const activeChat = {
            messages: [
                { senderId: 'user123', text: 'Hello', createdAt: new Date().toISOString(), isRead: true },
                { senderId: 'other', text: 'Hi there', createdAt: new Date().toISOString(), isRead: true },
            ],
        };
        render(<ChatWindow {...mockProps} activeChat={activeChat} />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there')).toBeInTheDocument();
    });

    it('renders input and handles change', () => {
        const activeChat = { messages: [] };
        render(<ChatWindow {...mockProps} activeChat={activeChat} />);
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'New message' } });
        expect(mockProps.setNewMessage).toHaveBeenCalledWith('New message');
    });

    it('calls sendNewMessage on button click', () => {
        const activeChat = { messages: [] };
        const props = { ...mockProps, activeChat, newMessage: 'Test msg' };
        render(<ChatWindow {...props} />);
        const button = screen.getByText('Send');
        fireEvent.click(button);
        expect(props.sendNewMessage).toHaveBeenCalledWith('Test msg');
    });

    it('calls sendNewMessage on Enter key', () => {
        const activeChat = { messages: [] };
        const props = { ...mockProps, activeChat, newMessage: 'Test msg' };
        render(<ChatWindow {...props} />);
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(props.sendNewMessage).toHaveBeenCalledWith('Test msg');
    });

    it('renders load more button when hasMore is true', () => {
        const activeChat = { messages: [] };
        render(<ChatWindow {...mockProps} activeChat={activeChat} hasMore={true} />);
        const button = screen.getByText('Load older messages');
        fireEvent.click(button);
        expect(mockProps.loadOlderMessages).toHaveBeenCalled();
    });

    it('renders back button on mobile', () => {
        const activeChat = { messages: [] };
        render(<ChatWindow {...mockProps} activeChat={activeChat} isMobile={true} />);
        const button = screen.getByText(/Back to Chats/);
        fireEvent.click(button);
        expect(mockProps.handleBackToSidebar).toHaveBeenCalled();
    });

    it('does not render back button on desktop', () => {
        const activeChat = { messages: [] };
        render(<ChatWindow {...mockProps} activeChat={activeChat} isMobile={false} />);
        expect(screen.queryByText(/Back to Chats/)).not.toBeInTheDocument();
    });
});
