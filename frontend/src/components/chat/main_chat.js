import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatWindow from './chat_window';
import ChatSidebar from './chat_sidebar';
import { useChatManager } from "../api_managers/useChatManager";
import "./main_chat.css";
import { useQueryClient } from '@tanstack/react-query';
/**
 * MainChat component serves as the layout wrapper for the chat feature.
 * It manages the high-level state from navigation (router location)
 * and orchestrates the Sidebar and ChatWindow.
 */
const MainChat = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Destructure contextual data passed via navigation state (e.g. from Order or Product pages)
  const {
    newOrderNumber: orderNumber,
    orderId,
    productId,
    sellerId,
    partnerId,
    newChatType: routeChatType,
    message
  } = location.state || {};
  console.log("MainChat orderNumber", orderNumber);
  console.log("MainChat sellerId", sellerId);
  console.log("MainChat partnerId", partnerId);
  console.log("MainChat routeChatType", routeChatType);
  console.log("MainChat message", message);

  const [userId, setUserId] = useState(null);
  const [isChatFromOrderItem, setIsChatFromOrderItem] = useState(false);
  console.log("MainChat userId", userId);
  console.log("MainChat isChatFromOrderItem", isChatFromOrderItem);
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch current user ID from storage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  // Determine if this chat session started from a specific order
  useEffect(() => {
    setIsChatFromOrderItem(!!orderNumber);
  }, [orderNumber]);

  /**
   * Initialize the main chat manager.
   * Partner ID priority: partnerId -> sellerId -> default 1 (Admin)
   */
  const chatManager = useChatManager(
    userId,
    localStorage.getItem("token"),
    partnerId || sellerId || null,
    routeChatType || "",
    orderNumber || "",
    message || "",
    orderId,
    productId
  );

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      // WICHTIG: Sobald wir auf die Chat-Seite kommen, 
      // sagen wir React Query, dass die Chat-Liste neu geladen werden muss.
      queryClient.invalidateQueries(['chats', String(storedUserId)]);
    }
  }, [queryClient]);

  console.log("MainChat chatManager", chatManager);
  return (
    <div className="main-chat-container">
      <div className="main-chat">

        {/* Sidebar: Shown if not hidden */}
        {!chatManager.isSidebarHidden && (
          <ChatSidebar
            {...chatManager} // Das reicht oft nicht, wenn Destructuring im Manager anders benannt ist
            selectedChatId={chatManager.selectedChatId} // Explizit übergeben!
            handleSelectChat={chatManager.handleSelectChat}
            sidebarPage={chatManager.sidebarPage}
            setSidebarPage={chatManager.setSidebarPage}
            totalPages={chatManager.totalPages}
          />
        )}

        {/* Chat Window: Shown when a chat is selected/active */}
        {chatManager.isChatWindowActive && (
          <div className="chat-window active">
            <ChatWindow
              {...chatManager}
              userId={userId}
              activeChat={chatManager.activeChat}
              messages={chatManager.messages}
              onBack={chatManager.handleBackToSidebar}
              onSend={chatManager.handleSendMessage}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default MainChat;
