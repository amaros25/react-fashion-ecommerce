import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronLeft } from "react-icons/fa";
import "./chat_window.css";

/**
 * ChatWindow component displays the message history of the selected conversation
 * and provides the input for sending new messages.
 */
const ChatWindow = ({
  activeChat,
  userId,
  hasMoreMessages,
  loadOlderMessages,
  handleMarkAsRead,
  handleSendMessage,
  newMessage,
  setNewMessage,
  isLoadingMessages,
  isMobile,
  onBack, // Renamed for consistency with handleBackToSidebar
  isChatDisabled,
  isNewChat,
  messages,
  initialChatType,
  initialSubjectNumber
}) => {
  const { t, i18n } = useTranslation();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const readTimeoutRef = useRef(null);

  // Ref to track if we were at the bottom before a state update
  const wasScrolledToBottom = useRef(true);
  const isRtl = i18n.dir() === "rtl";

  // Auto-scroll to bottom on new messages if user was already at the bottom
  useLayoutEffect(() => {
    if (messagesContainerRef.current && !isLoadingMessages) {
      const container = messagesContainerRef.current;

      // Prüfen, ob wir scrollen müssen
      const isUserLastSender = messages.length > 0 && String(messages[messages.length - 1].senderId) === String(userId);
      const shouldScroll = wasScrolledToBottom.current || isUserLastSender;

      if (shouldScroll) {
        // Wir nutzen ein doppeltes RequestAnimationFrame. 
        // Das garantiert, dass Chrome das Layout wirklich fertig berechnet hat.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: isUserLastSender ? 'smooth' : 'auto'
            });
            // Sicherheits-Check: Falls 'smooth' in Chrome hakt, erzwinge 'auto' nach 100ms
            setTimeout(() => {
              container.scrollTop = container.scrollHeight;
            }, 100);
          });
        });
      }
    }
  }, [messages, isLoadingMessages, userId]);

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
      handleSendMessage(newMessage);
    }
  };

  // IntersectionObserver to mark messages as read only when visible
  useEffect(() => {
    if (!activeChat || !userId || messages.length === 0) return;

    const unreadMessages = messages.filter(m => String(m.senderId) !== String(userId) && !m.isRead);
    if (unreadMessages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleIds = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.getAttribute('data-message-id'));

        if (visibleIds.length > 0) {
          if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
          readTimeoutRef.current = setTimeout(() => {
            handleMarkAsRead?.(visibleIds);
          }, 1000); // Warte 1 Sekunde, um alle sichtbaren IDs zu sammeln
        }
      }, { threshold: 0.5 });

    const messageElements = document.querySelectorAll('.message.partner.unread');
    messageElements.forEach(el => observer.observe(el));


    return () => {
      observer.disconnect();
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
  }, [messages, activeChat, userId, handleMarkAsRead]);

  return (
    <div className="chat-window-content">
      {activeChat || isNewChat ? (
        <>
          <div className="chat-window-header">
            {isMobile && (
              <button className="back-button" onClick={onBack}>
                <FaChevronLeft />
              </button>
            )}
            <div className="header-info">
              <h3>
                {activeChat ? (
                  (activeChat.participant1Id === 1 || activeChat.participant2Id === 1) ? t("chat.chatWithAdmin") : (activeChat.otherParticipant?.name || t("chat.customer"))
                ) : (
                  initialChatType === "support" ? t("chat.chatWithAdmin") : (activeChat?.otherParticipant?.name || t("chat.customer"))
                )}
              </h3>
              <p className="chat-subject-line">
                <strong>{activeChat?.type === 'order' || (!activeChat && initialChatType === 'order') ? t('chat.order') : t('chat.product')}</strong>
                {`: ${activeChat?.subjectNumber || initialSubjectNumber || ''}`}
              </p>
            </div>
          </div>

          {/* Messages List Area */}
          <div className={`messages ${isRtl ? 'rtl' : ''}`} ref={messagesContainerRef} onScroll={handleScroll}>
            {isNewChat && messages.length === 0 && (
              <div className="new-chat-notice">
                {t('chat.startConversation') || "Start a new conversation"}
              </div>
            )}

            {/* "Load Older" button for pagination */}
            {hasMoreMessages && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={loadOlderMessages} disabled={isLoadingMessages}>
                  {isLoadingMessages ? t('chat.loading') : t('chat.loadOlderMessages')}
                </button>
              </div>
            )}

            {/* Render message bubbles */}
            {(messages || []).map((msg, idx) => {
              const isUserMessage = String(msg.senderId) === String(userId);
              return (
                <div
                  key={msg.id || idx}
                  data-message-id={msg.id}
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
                onClick={() => handleSendMessage(newMessage)}
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
