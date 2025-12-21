import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "./main_chat.css";
import "./chat_sidebar.css";

const ChatSidebar = ({
  chats = [],
  activeChat,
  newChatType,
  setNewChatType,
  newChatNumber,
  setNewChatNumber,
  startNewChatAndSendMessage,
  is_chat_from_order_item,
  setIsChatFromOrderItem,
  isSidebarHidden,
  handleOpenChat,
  totalPages,
  sidebarCurrentPage,
  setSidebarCurrentPage,
}) => {

  const { t } = useTranslation();

  const handleCancelChat = () => {
    setIsChatFromOrderItem(false);
    setNewChatType("product");
    setNewChatNumber("");
  };

  const chatExists = (chatNumber) => {
    return chats.some(
      (chat) => chat.number === chatNumber && (chat.type === newChatType)
    );
  };

  const getPaginationRange = (totalPages, currentPage) => {
    const maxVisiblePages = 5;
    let range = [];
    if (totalPages <= maxVisiblePages) {
      range = Array.from({ length: totalPages }, (_, index) => index + 1);
    } else {
      range = [1];
      if (currentPage <= 3) {
        range = [...range, 2, 3, 4];
      } else if (currentPage >= totalPages - 2) {
        range = [...range, totalPages - 3, totalPages - 2, totalPages - 1];
      } else {
        range = [...range, currentPage - 1, currentPage, currentPage + 1];
      }
      range.push(totalPages);
    }
    if (range[1] > 2) {
      range = [1, '...', ...range.slice(1)];
    }
    if (range[range.length - 2] < totalPages - 1) {
      range = [...range.slice(0, -1), '...', totalPages];
    }
    return range;
  };

  const sortedChats = Array.isArray(chats) ? chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) : [];

  return (
    <div className={`chat-sidebar ${isSidebarHidden ? 'hidden' : ''}`}>
      {/* <div className="new-chat">
        <select
          value={newChatType}
          onChange={(e) => {
            if (!is_chat_from_order_item) {
              const value = e.target.value;
              setNewChatType(value);
              setNewChatNumber("");
            }
          }}
          disabled={is_chat_from_order_item}
        >
          <option value="product">{t('chat.product') || "Product"}</option>
          <option value="order">{t('chat.order') || "Order"}</option>
        </select>
        {(newChatType === "order" || newChatType === "product") && (
          <input
            type="text"
            placeholder={newChatType === "order" ? t('chat.newChatPlaceholderOrder') : t('chat.newChatPlaceholderProduct')}
            value={newChatNumber}
            onChange={(e) => {
              if (!is_chat_from_order_item) {
                setNewChatNumber(e.target.value)
              }
            }}
          />
        )}
        <button
          className="chatsidebar-button"
          onClick={() => {
            if (newChatNumber.trim() === "") {
              toast.error(t('chat.noChat'));
              return;
            }
            if (chatExists(newChatNumber)) {
              toast.error(t('chat.chatAlreadyExists'));
              return;
            }

            startNewChatAndSendMessage("");
          }}
        >
          {is_chat_from_order_item ? t('chat.newChatWithSeller') : t('chat.newChatWithAdmin')}
        </button>

        {is_chat_from_order_item && (
          <button onClick={handleCancelChat} className="cancel-btn">
            {t('chat.cancel_with_seller')}
          </button>
        )}

      </div> */}
      <div className="conversation-list">
        {sortedChats.length === 0 ? (
          <div className="no-chats-message">
            <p>{t('chat.noMessages')}</p>
          </div>
        ) : (
          sortedChats.map((chat) => {
            const lastMessage = chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1].text : t('chat.noMessages');
            return (
              <div
                key={chat._id}
                className={`chat-card ${activeChat?._id === chat._id ? "active" : ""}`}
                onClick={() => handleOpenChat(chat._id)}
              >
                <div>
                  <strong>{chat.type === "order" ? t('chat.order') : t('chat.product')}</strong>
                  {(chat.type === "order" || chat.type === "product") && (
                    `: ${chat.number || t('chat.noMessages')}`
                  )}
                </div>
                <div>
                  <strong>{t('chat.lastMessage')}:</strong> {lastMessage}
                </div>
                <div className="chat-date">
                  {chat.updatedAt && new Date(chat.updatedAt).toLocaleString()}
                </div>
              </div>
            );
          }))}
      </div>
      <div className="pagination">
        {totalPages > 1 && (
          getPaginationRange(totalPages, sidebarCurrentPage).map((page, index) => (
            <button
              key={index}
              onClick={() => {
                if (page !== '...') {
                  setSidebarCurrentPage(page);  // Seite wechseln
                }
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
