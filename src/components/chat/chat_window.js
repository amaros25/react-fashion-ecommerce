// ChatWindow.js
import React, {useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const ChatWindow = ({ activeChat, userId, hasMore, loadOlderMessages, sendNewMessage, newMessage, setNewMessage }) => {
  const { t, i18n } = useTranslation();
  const messagesRef = useRef(null);

  useEffect(() => {
    if (activeChat && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [activeChat, newMessage]);

  return (
    <div className="chat-window">
      {activeChat ? (
        <>
          <div className="messages" ref={messagesRef}>
            {hasMore && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={loadOlderMessages}>
                  Load older messages
                </button>
              </div>
            )}
            {(activeChat?.messages || []).map((msg, idx) => {
              const isUserMessage = msg.senderId.toString() === userId;
              return (
              <div
                  key={idx}
                  className={`message ${isUserMessage ? "user" : "admin"} ${msg.isRead ? "read" : "unread"}`}
                >
                  {msg.text}
                  <div className="msg-date">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
 {                  isUserMessage && !msg.isRead && (
                    <span className="unread-indicator">{t('chat.unread')}</span>
                    )}
                    {isUserMessage && msg.isRead && (
                      <span className="read-indicator">{t('chat.read')}</span>
                    )}
                </div>
              );
            })}
          </div>
          <div className="message-input">
          <input
            type="text"
            placeholder={t('chat.messagePlaceholder')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendNewMessage(newMessage)}
          />
          <button onClick={() => sendNewMessage(newMessage)}>{t('chat.sendButton')}</button> 
          </div>
        </>
      ) : (
        <div className="no-chat">{t('chat.noChat')}</div>  
      )}
    </div>
  );
};

export default ChatWindow;
