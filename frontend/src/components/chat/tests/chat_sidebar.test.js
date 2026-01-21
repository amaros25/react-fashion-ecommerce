import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatSidebar from '../chat_sidebar';

// Mock translations
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'chat.product': 'Product',
                'chat.order': 'Order',
                'chat.newChatPlaceholderOrder': 'Order Number',
                'chat.newChatPlaceholderProduct': 'Product Name',
                'chat.newChatWithSeller': 'Start Chat with Seller',
                'chat.newChatWithAdmin': 'Start Chat with Admin',
                'chat.cancel_with_seller': 'Cancel',
                'chat.noChat': 'Please enter a number/name',
                'chat.chatAlreadyExists': 'Chat already exists',
                'chat.noMessages': 'No messages',
                'chat.lastMessage': 'Last message',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock toast
jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
    },
}));

describe('ChatSidebar', () => {
    const mockProps = {
        chats: [],
        activeChat: null,
        newChatType: 'product',
        setNewChatType: jest.fn(),
        newChatNumber: '',
        setNewChatNumber: jest.fn(),
        startNewChatAndSendMessage: jest.fn(),
        is_chat_from_order_item: false,
        setIsChatFromOrderItem: jest.fn(),
        isSidebarHidden: false,
        handleOpenChat: jest.fn(),
        totalPages: 1,
        sidebarCurrentPage: 1,
        setSidebarCurrentPage: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<ChatSidebar {...mockProps} />);
        expect(screen.getByText('Start Chat with Admin')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Product Name')).toBeInTheDocument();
    });

    it('renders chat list', () => {
        const chats = [
            {
                _id: '1',
                type: 'product',
                number: 'Prod1',
                updatedAt: new Date().toISOString(),
                messages: [{ text: 'Hello' }],
            },
            {
                _id: '2',
                type: 'order',
                number: 'Ord1',
                updatedAt: new Date().toISOString(),
                messages: [{ text: 'Hi' }],
            },
        ];
        render(<ChatSidebar {...mockProps} chats={chats} />);

        const productElement = screen.getAllByText('Product')[1]; // 0 is in select, 1 is in list
        expect(productElement.parentElement).toHaveTextContent(/Product:\s*Prod1/);

        const orderElement = screen.getAllByText('Order')[1]; // 0 is in select, 1 is in list
        expect(orderElement.parentElement).toHaveTextContent(/Order:\s*Ord1/);
    });

    it('handles input changes', () => {
        render(<ChatSidebar {...mockProps} />);
        const input = screen.getByPlaceholderText('Product Name');
        fireEvent.change(input, { target: { value: 'New Chat' } });
        expect(mockProps.setNewChatNumber).toHaveBeenCalledWith('New Chat');
    });

    it('handles type change', () => {
        render(<ChatSidebar {...mockProps} />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'order' } });
        expect(mockProps.setNewChatType).toHaveBeenCalledWith('order');
    });

    it('calls startNewChatAndSendMessage on button click', () => {
        const props = { ...mockProps, newChatNumber: 'Test Chat' };
        render(<ChatSidebar {...props} />);
        const button = screen.getByText('Start Chat with Admin');
        fireEvent.click(button);
        expect(props.startNewChatAndSendMessage).toHaveBeenCalled();
    });

    it('handles pagination', () => {
        const props = { ...mockProps, totalPages: 5, sidebarCurrentPage: 1 };
        render(<ChatSidebar {...props} />);
        const page2Button = screen.getByText('2');
        fireEvent.click(page2Button);
        expect(props.setSidebarCurrentPage).toHaveBeenCalledWith(2);
    });

    it('highlights active chat', () => {
        const chats = [
            {
                _id: '1',
                type: 'product',
                number: 'Prod1',
                updatedAt: new Date().toISOString(),
                messages: [],
            },
        ];
        const props = { ...mockProps, chats, activeChat: chats[0] };
        const { container } = render(<ChatSidebar {...props} />);
        // Check if the chat card has the 'active' class
        const activeCard = container.querySelector('.chat-card.active');
        expect(activeCard).toBeInTheDocument();
        expect(activeCard).toHaveTextContent(/Product:\s*Prod1/);
    });

    it('handles chat selection', () => {
        const chats = [
            {
                _id: '1',
                type: 'product',
                number: 'Prod1',
                updatedAt: new Date().toISOString(),
                messages: [],
            },
        ];
        render(<ChatSidebar {...mockProps} chats={chats} />);
        // Find the element containing 'Product' in the list (index 1, as index 0 is in the select dropdown)
        const productElement = screen.getAllByText('Product')[1];
        const chatCard = productElement.closest('.chat-card');
        fireEvent.click(chatCard);
        expect(mockProps.handleOpenChat).toHaveBeenCalledWith('1');
    });
});
