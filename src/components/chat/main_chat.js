import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from '../header/header';
import Foot from '../foot/foot';
import ChatWindow from './chat_window';
import ChatSidebar from './chat_sidebar';
import { useTranslation } from "react-i18next";
import { useChats } from "./use_chats";
import "./main_chat.css";

const MainChat = () => {
  console.log("MainChat");
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
      <Header />  {/* Header bleibt oben sichtbar */}
      <div className="main-chat">
        {/* Wenn es ein Desktop ist und das Chat-Fenster nicht aktiv ist, Sidebar immer anzeigen */}
        <>
        {console.log("*** LOG: isMobile", chatHook.isMobile)}
        {console.log("*** LOG: isChatWindowActive", chatHook.isChatWindowActive)}
        {console.log("*** LOG: isSidebarHidden", chatHook.isSidebarHidden)}
        </>
        {  !chatHook.isSidebarHidden && (
          <ChatSidebar 
            {...chatHook} 
            startChat={() => chatHook.setIsNewChat(true)}
            is_chat_from_order_item={isChatFromOrderItem} 
          />
        )}

        {/* Wenn es ein Mobilgerät ist und das Chat-Fenster aktiv ist, nur Chat-Fenster anzeigen */}
        {chatHook.isMobile && chatHook.isChatWindowActive && (
          <div className="chat-window active">
            <ChatWindow 
              {...chatHook} 
              userId={userId} 
              onBack={chatHook.handleBackToSidebar}
            />
          </div>
        )}

        {/* Wenn das Chat-Fenster auf einem Desktop aktiv ist, Sidebar nicht ausblenden */}
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
      <Foot />  {/* Footer bleibt unten sichtbar */}
    </div>
  );
};

export default MainChat;
