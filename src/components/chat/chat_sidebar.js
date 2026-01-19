import React from "react";
import { useTranslation } from "react-i18next";
import "./main_chat.css";
import "./chat_sidebar.css";

/**
 * ChatSidebar component displays the list of conversations and handles pagination.
 */
const ChatSidebar = ({
  chats = [],
  activeChat,
  setSidebarCurrentPage,
  sidebarCurrentPage,
  totalPages,
  handleOpenChat,
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
      <div className="conversation-list">
        {sortedChats.length === 0 ? (
          <div className="no-chats-message">
            <p>{t('chat.noMessages')}</p>
          </div>
        ) : (
          sortedChats.map((chat) => {
            // Get text of the last message or a placeholder
            const lastMessage = chat.messages?.length > 0
              ? chat.messages[chat.messages.length - 1].text
              : t('chat.noMessages');

            return (
              <div
                key={chat.id}
                className={`chat-card ${activeChat?.id === chat.id ? "active" : ""}`}
                onClick={() => handleOpenChat(chat.id)}
              >
                <div>
                  <strong>{chat.otherParticipant?.name || t('chat.customer')}</strong>
                </div>
                <div>
                  <strong>{chat.type === "order" ? t('chat.order') : t('chat.product')}</strong>
                  {`: ${chat.subjectNumber || t('chat.noNumberAvailable')}`}
                </div>
                <div>
                  <strong>{t('chat.lastMessage')}:</strong> {lastMessage}
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
          getPaginationRange(totalPages, sidebarCurrentPage).map((page, index) => (
            <button
              key={index}
              onClick={() => {
                if (page !== '...') setSidebarCurrentPage(page);
              }}
              className={`page-btn ${sidebarCurrentPage === page ? 'active' : ''}`}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
