import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchChats, openChat, sendMessage, loadMoreMessages, startNewChat, markMessagesAsRead } from "./chat_api";
import { Header } from '../header/header';
import Foot from '../foot/foot';
import ChatWindow from './chat_window';
import ChatSidebar from './chat_sidebar';
import { useTranslation } from "react-i18next";
import { useChats } from "./use_chats";
import "./main_chat.css";

const MainChat = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { newOrderNumber: orderNumber, sellerId, newChatType: routeChatType } = location.state || {};
  const [userId, setUserId] = useState(null);

  const [isChatFromOrderItem, setIsChatFromOrderItem] = useState(false);
 

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

  const chatHook = useChats(userId, sellerId, routeChatType || "product", orderNumber || "");

  return (
    <div className="main-chat-container">
      <Header />
      <div className="main-chat">
        <ChatSidebar {...chatHook} startChat={() => chatHook.setIsNewChat(true)}
          is_chat_from_order_item={isChatFromOrderItem} 
          setIsChatFromOrderItem={setIsChatFromOrderItem}
          />
        <ChatWindow {...chatHook} userId={userId} />
      </div>
      <Foot />
    </div>
  );
};

export default MainChat;