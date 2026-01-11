import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatWindow from './chat_window';
import ChatSidebar from './chat_sidebar';
import { useChats } from "./use_chats";
import "./main_chat.css";

/**
 * MainChat component serves as the layout wrapper for the chat feature.
 * It manages the high-level state from navigation (router location)
 * and orchestrates the Sidebar and ChatWindow.
 */
const MainChat = () => {
  const location = useLocation();

  // Destructure contextual data passed via navigation state (e.g. from Order or Product pages)
  const {
    newOrderNumber: orderNumber,
    sellerId,
    partnerId,
    newChatType: routeChatType,
    message
  } = location.state || {};

  const [userId, setUserId] = useState(null);
  const [isChatFromOrderItem, setIsChatFromOrderItem] = useState(false);

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
   * Initialize the main chat hook which handles all business logic.
   * Partner ID priority: partnerId -> sellerId -> default "admin"
   */
  const chatHook = useChats(
    userId,
    partnerId || sellerId || "admin",
    routeChatType || "",
    orderNumber || "",
    message || ""
  );

  return (
    <div className="main-chat-container">
      <div className="main-chat">

        {/* Sidebar: Shown if not hidden (e.g. hidden on mobile when chat is active) */}
        {!chatHook.isSidebarHidden && (
          <ChatSidebar
            {...chatHook}
            startChat={() => chatHook.setIsNewChat(true)}
            is_chat_from_order_item={isChatFromOrderItem}
          />
        )}

        {/* Chat Window: Shown when a chat is selected/active */}
        {chatHook.isChatWindowActive && (
          <div className="chat-window active">
            <ChatWindow
              {...chatHook}
              userId={userId}
              onBack={chatHook.handleBackToSidebar}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default MainChat;
