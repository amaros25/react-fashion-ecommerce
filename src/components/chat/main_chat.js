import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import ChatWindow from './chat_window';
import ChatSidebar from './chat_sidebar';
import { useTranslation } from "react-i18next";
import { useChats } from "./use_chats";
import "./main_chat.css";
import { fetchChats } from "./chat_api";

const MainChat = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { newOrderNumber: orderNumber, sellerId, partnerId, newChatType: routeChatType } = location.state || {};
  const [userId, setUserId] = useState(null);
  const [isChatFromOrderItem, setIsChatFromOrderItem] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (orderNumber) {
      setIsChatFromOrderItem(true);
    } else {
      setIsChatFromOrderItem(false);
    }
  }, [orderNumber]);

  const chatHook = useChats(userId, partnerId || sellerId, routeChatType || "product", orderNumber || "");

  return (
    <div className="main-chat-container">

      <div className="main-chat">
        {!chatHook.isSidebarHidden && (
          <ChatSidebar
            {...chatHook}
            startChat={() => chatHook.setIsNewChat(true)}
            is_chat_from_order_item={isChatFromOrderItem}
          />
        )}
        {chatHook.isMobile && chatHook.isChatWindowActive && (
          <div className="chat-window active">
            <ChatWindow
              {...chatHook}
              userId={userId}
              onBack={chatHook.handleBackToSidebar}
            />
          </div>
        )}
        {!chatHook.isMobile && chatHook.isChatWindowActive && (
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
