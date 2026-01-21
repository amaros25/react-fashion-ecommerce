import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChatUI } from "./hooks/use_chat_ui";
import { useChatList } from "./hooks/use_chat_list";
import { useChatMessages } from "./hooks/use_chat_messages";
import { useChatRestrictions } from "./hooks/use_chat_restrictions";

/**
 * Main hook for Chat functionality.
 * Orchestrates Specialized hooks for UI, List, Messages, and Restrictions.
 */
export const useChats = (userId, partnerId, initialType, initialNumber, initialMessage) => {
  const { token } = useAuth();
  const hasInitializedFromMessage = useRef(false);

  // 1. UI State Management
  const ui = useChatUI();

  // 2. Message & Active Chat Management
  const [chats, setChats] = useState([]);
  const messages = useChatMessages(userId, token, setChats, chats);

  // 3. Handle opening a chat (UI + Data)
  // Destructure functions to ensure stable dependencies in the useCallback
  const { setCurrentChatID } = messages;
  const { handleUIOnChatOpen } = ui;

  const handleOpenChat = useCallback((chatId) => {
    setCurrentChatID(chatId);
    handleUIOnChatOpen();
  }, [setCurrentChatID, handleUIOnChatOpen]);

  // 4. Chat List & Sidebar Management
  const list = useChatList(
    userId,
    partnerId,
    token,
    initialType,
    initialNumber,
    initialMessage,
    handleOpenChat,
    chats,
    setChats
  );

  // 5. Chat Restrictions
  const restrictions = useChatRestrictions(messages.activeChat, token);

  // Internal states for "New Chat" flow (if any)
  const [newChatType, setNewChatType] = useState(initialType);
  const [newChatNumber, setNewChatNumber] = useState(initialNumber);
  const [isNewChat, setIsNewChat] = useState(false);

  // Initialization from initial message (Order/Product page)
  useEffect(() => {
    if (
      hasInitializedFromMessage.current ||
      !userId ||
      (!initialMessage?.trim() && !initialNumber?.trim())
    ) {
      return;
    }

    hasInitializedFromMessage.current = true;
    if (initialMessage) messages.setNewMessage(initialMessage);

    ui.setIsChatWindowActive(true);
    ui.setIsSidebarHidden(ui.isMobile);

  }, [initialMessage, initialNumber, userId, ui.isMobile, messages.setNewMessage, ui.setIsChatWindowActive, ui.setIsSidebarHidden]);

  // Effect to load chat details when ID changes
  useEffect(() => {
    if (ui.isChatWindowActive) {
      messages.openSelectedChat(messages.currentChatID);
    }
  }, [ui.isChatWindowActive, messages.currentChatID, messages.openSelectedChat]);

  // Wrapper for sending messages to include partnerId context
  const sendNewMessage = useCallback(async (msg) => {
    await messages.handleSendNewMessage(msg, partnerId);
  }, [messages, partnerId]);

  // Re-syncing list and messages states (internal optimization)
  // We use the 'chats' state from useChats as the single source of truth.
  // Let's update useChatList to accept setChats.

  return {
    chats: list.chats,
    activeChat: messages.activeChat,
    openSelectedChat: handleOpenChat,
    newChatType,
    setNewChatType,
    newChatNumber,
    setNewChatNumber,
    isNewChat,
    setIsNewChat,
    newMessage: messages.newMessage,
    setNewMessage: messages.setNewMessage,
    sendNewMessage,
    // startNewChatAndSendMessage is largely replaced by laziness in handleSendNewMessage
    // But we keep it for compatibility if needed or implement a simpler version
    startNewChatAndSendMessage: sendNewMessage,
    loadOlderMessages: messages.loadOlderMessages,
    hasMore: messages.hasMore,
    isLoadingOlder: messages.isLoadingOlder,
    isMobile: ui.isMobile,
    isSidebarHidden: ui.isSidebarHidden,
    setIsSidebarHidden: ui.setIsSidebarHidden,
    isChatWindowActive: ui.isChatWindowActive,
    handleOpenChat,
    handlePageChange: list.handlePageChange,
    totalPages: list.totalPages,
    sidebarCurrentPage: list.sidebarCurrentPage,
    setSidebarCurrentPage: list.setSidebarCurrentPage,
    handleBackToSidebar: ui.handleBackToSidebar,
    isChatDisabled: restrictions.isChatDisabled
  };
};
