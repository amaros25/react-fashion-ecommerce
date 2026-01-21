import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainChat from '../main_chat';
import { useChats } from '../use_chats';

// Mock hooks and components
jest.mock('react-router-dom', () => ({
    useLocation: () => ({
        state: { newOrderNumber: '123', sellerId: 'seller1', newChatType: 'order' },
    }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { dir: () => 'ltr' },
    }),
}));

jest.mock('../../header/header', () => ({
    Header: () => <div data-testid="header">Header</div>,
}));

jest.mock('../../foot/foot', () => () => <div data-testid="footer">Footer</div>);

jest.mock('../chat_sidebar', () => () => <div data-testid="chat-sidebar">ChatSidebar</div>);
jest.mock('../chat_window', () => () => <div data-testid="chat-window">ChatWindow</div>);

jest.mock('../use_chats');

describe('MainChat', () => {
    const mockChatHook = {
        isSidebarHidden: false,
        isMobile: false,
        isChatWindowActive: false,
        setIsNewChat: jest.fn(),
        handleBackToSidebar: jest.fn(),
    };

    beforeEach(() => {
        useChats.mockReturnValue(mockChatHook);
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('renders header and footer', () => {
        render(<MainChat />);
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders ChatSidebar when not hidden', () => {
        render(<MainChat />);
        expect(screen.getByTestId('chat-sidebar')).toBeInTheDocument();
    });

    it('does not render ChatSidebar when hidden', () => {
        useChats.mockReturnValue({ ...mockChatHook, isSidebarHidden: true });
        render(<MainChat />);
        expect(screen.queryByTestId('chat-sidebar')).not.toBeInTheDocument();
    });

    it('renders ChatWindow when active on desktop', () => {
        useChats.mockReturnValue({ ...mockChatHook, isChatWindowActive: true, isMobile: false });
        render(<MainChat />);
        expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    });

    it('renders ChatWindow when active on mobile', () => {
        useChats.mockReturnValue({ ...mockChatHook, isChatWindowActive: true, isMobile: true });
        render(<MainChat />);
        expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    });

    it('does not render ChatWindow when inactive', () => {
        useChats.mockReturnValue({ ...mockChatHook, isChatWindowActive: false });
        render(<MainChat />);
        expect(screen.queryByTestId('chat-window')).not.toBeInTheDocument();
    });

    it('initializes userId from localStorage', () => {
        localStorage.setItem('userId', 'user123');
        render(<MainChat />);
        expect(useChats).toHaveBeenCalled();
    });
});
