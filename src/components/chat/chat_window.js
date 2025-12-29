import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./chat_window.css";

const ChatWindow = ({
  activeChat,
  userId,
  hasMore,
  loadOlderMessages,
  sendNewMessage,
  newMessage,
  setNewMessage,
  isLoadingOlder,
  isMobile,
  handleBackToSidebar,
  isChatDisabled
}) => {
  const { t, i18n } = useTranslation();
  const messagesRef = useRef(null);
  const wasScrolledToBottom = useRef(true);
  const isRtl = i18n.dir() == "rtl";


  useEffect(() => {
    if (activeChat && messagesRef.current && !isLoadingOlder) {
      if (wasScrolledToBottom.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    }
  }, [activeChat, newMessage, isLoadingOlder]);

  const handleScroll = () => {
    if (messagesRef.current) {
      const scrollTop = messagesRef.current.scrollTop;
      const scrollHeight = messagesRef.current.scrollHeight;
      const clientHeight = messagesRef.current.clientHeight;
      if (scrollHeight - scrollTop === clientHeight) {
        wasScrolledToBottom.current = true;
      } else {
        wasScrolledToBottom.current = false;
      }
    }
  };

  return (
    <div className="chat-window-content">
      {activeChat ? (
        <>
          {isMobile && (
            <button className="back-button" onClick={handleBackToSidebar}>
              &larr; {t('chat.backToChats')}
            </button>
          )}
          <div className="messages" ref={messagesRef} onScroll={handleScroll}>
            {hasMore && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={loadOlderMessages}>
                  {t('chat.loadOlderMessages')}
                </button>
              </div>
            )}
            {(activeChat?.messages || []).map((msg, idx) => {
              const isUserMessage = msg.senderId.toString() === userId;
              return (
                <div
                  key={idx}
                  className={`message ${isUserMessage ? "user" : "admin"} ${msg.isRead ? "read" : "unread"} ${isRtl ? 'rtl' : ''}`}
                >
                  {msg.text}
                  <div className="msg-date">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                  {isUserMessage && !msg.isRead && (
                    <span className="unread-indicator">{t('chat.unread')}</span>
                  )}
                  {isUserMessage && msg.isRead && (
                    <span className="read-indicator">{t('chat.read')}</span>
                  )}
                </div>
              );
            })}
          </div>
          {isChatDisabled ? (
            <div className="chat-disabled-notice">
              {t('chat.disabledNotice')}
            </div>
          ) : (
            <div className="message-input">
              <input
                type="text"
                placeholder={t('chat.messagePlaceholder')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendNewMessage(newMessage)}
              />
              <button
                onClick={() => sendNewMessage(newMessage)}
                disabled={!newMessage.trim()}
              >
                {t('chat.sendButton')}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="no-chat">{t('chat.noChat')}</div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
