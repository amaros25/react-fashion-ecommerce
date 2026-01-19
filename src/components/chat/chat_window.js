import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./chat_window.css";

/**
 * ChatWindow component displays the message history of the selected conversation
 * and provides the input for sending new messages.
 */
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
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Ref to track if we were at the bottom before a state update
  const wasScrolledToBottom = useRef(true);
  const isRtl = i18n.dir() === "rtl";

  // Auto-scroll to bottom on new messages if user was already at the bottom
  useEffect(() => {
    if (activeChat && messagesContainerRef.current && !isLoadingOlder) {
      if (wasScrolledToBottom.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  }, [activeChat, newMessage, isLoadingOlder]);

  /**
   * Monitor scroll position to determine if we should auto-scroll on next update.
   */
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // Define a "sticky" threshold (e.g. 10px from bottom)
      const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 10;
      wasScrolledToBottom.current = isAtBottom;
    }
  };

  /**
   * Helper to send message when Enter is pressed.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && newMessage.trim()) {
      sendNewMessage(newMessage);
    }
  };

  return (
    <div className="chat-window-content">
      {activeChat ? (
        <>
          {/* Back button for mobile navigation */}
          {isMobile && (
            <button className="back-button" onClick={handleBackToSidebar}>
              &larr; {t('chat.backToChats')}
            </button>
          )}

          {/* Messages List Area */}
          <div className={`messages ${isRtl ? 'rtl' : ''}`} ref={messagesContainerRef} onScroll={handleScroll}>
            {/* "Load Older" button for pagination */}
            {hasMore && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={loadOlderMessages} disabled={isLoadingOlder}>
                  {isLoadingOlder ? t('chat.loading') : t('chat.loadOlderMessages')}
                </button>
              </div>
            )}

            {/* Render message bubbles */}
            {(activeChat?.messages || []).map((msg, idx) => {
              const isUserMessage = String(msg.senderId) === String(userId);
              return (
                <div
                  key={msg.id || idx}
                  className={`message ${isUserMessage ? "user" : "partner"} ${msg.isRead ? "read" : "unread"} ${isRtl ? 'rtl' : ''}`}
                >
                  <div className="msg-text">{msg.text}</div>
                  <div className="msg-footer">
                    <span className="msg-date">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isUserMessage && (
                      <span className={`status-indicator ${msg.isRead ? 'read' : 'unread'}`}>
                        {msg.isRead ? t('chat.read') : t('chat.unread')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area: Disabled if order status prevents chatting */}
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
                onKeyDown={handleKeyDown}
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
        <div className="no-chat-selected">
          <p>{t('chat.selectAChat') || t('chat.noChat')}</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
