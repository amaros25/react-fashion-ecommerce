import React from "react";
import { useTranslation } from "react-i18next";
import "./main_chat.css";
import "./chat_sidebar.css";

/**
 * ChatSidebar component displays the list of conversations and handles pagination.
 */
const ChatSidebar = ({
  chats = [],
  selectedChatId,
  sidebarPage,
  setSidebarPage,
  totalPages,
  handleSelectChat,
  isSidebarHidden
}) => {
  const { t } = useTranslation();

  /**
   * Helper to generate the pagination range with ellipses if needed.
   * e.g. [1, "...", 4, 5, 6, "...", 10]
   */
  const getPaginationRange = (total, current) => {
    const maxVisiblePages = 5;
    let range = [];

    if (total <= maxVisiblePages) {
      range = Array.from({ length: total }, (_, index) => index + 1);
    } else {
      range = [1];
      if (current <= 3) {
        range = [...range, 2, 3, 4];
      } else if (current >= total - 2) {
        range = [...range, total - 3, total - 2, total - 1];
      } else {
        range = [...range, current - 1, current, current + 1];
      }
      range.push(total);
    }

    // Add ellipses logic
    if (range[1] > 2) {
      range = [1, '...', ...range.slice(1)];
    }
    if (range[range.length - 2] < total - 1) {
      range = [...range.slice(0, -1), '...', total];
    }
    return range;
  };

  // Ensure chats are sorted by latest activity
  const sortedChats = Array.isArray(chats)
    ? [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    : [];

  return (
    <div className={`chat-sidebar ${isSidebarHidden ? 'hidden' : ''}`}>
      <div className="sidebar-header">
        <h2>{t('chat.messages') || 'Messages'}</h2>
      </div>
      <div className="conversation-list">
        {sortedChats.length === 0 ? (
          <div className="no-chats-message">
            <p>{t('chat.noMessages')}</p>
          </div>
        ) : (
          sortedChats.map((chat) => {
            // Get text of the last message or a placeholder
            const isActive = String(selectedChatId) === String(chat.id);
            const lastMessagePreview = chat.lastMessage ||
              (chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1].text : t('chat.noMessages'));

            return (
              <div
                key={chat.id}
                className={`chat-card ${isActive ? "active" : ""} ${chat.unreadCount > 0 ? "unread" : ""}`}
                onClick={() => {
                  console.log("Chat geklickt:", chat.id);
                  handleSelectChat(chat.id);
                }}
              >
                <div className="chat-card-header">
                  <strong>
                    {chat.type === "support" || chat.participant1Id === 1 || chat.participant2Id === 1
                      ? t("chat.chatWithAdmin")
                      : (chat.otherParticipant?.name || t("chat.customer"))
                    }
                  </strong>
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
                <div>
                  <strong>{chat.type === "order" ? t('chat.order') : t('chat.product')}</strong>
                  {`: ${chat.subjectNumber || t('chat.noNumberAvailable')}`}
                </div>
                <div className="last-message-preview">
                  <strong>{t('chat.lastMessage')}:</strong> {lastMessagePreview}
                </div>
                <div className="chat-date">
                  {chat.updatedAt && new Date(chat.updatedAt).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-chat">
        {totalPages > 1 && (
          getPaginationRange(totalPages, sidebarPage).map((p, index) => (
            <button
              key={index}
              onClick={() => {
                if (p !== '...') setSidebarPage(p);
              }}
              className={`page-btn ${sidebarPage === p ? 'active' : ''}`}
              disabled={p === '...'}
            >
              {p}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
