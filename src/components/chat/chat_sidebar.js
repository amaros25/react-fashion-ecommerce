import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "./main_chat.css";
import "./chat_sidebar.css";

const ChatSidebar = ({
  chats,
  activeChat,
  newChatType,
  setNewChatType,
  newChatNumber,
  setNewChatNumber,
  startNewChatAndSendMessage,
  is_chat_from_order_item,
  setIsChatFromOrderItem,
  isSidebarHidden,
  handleOpenChat
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

  return (
    <div className={`chat-sidebar ${isSidebarHidden ? 'hidden' : ''}`}>
      <div className="new-chat">
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
          onClick={() => {
            if (newChatNumber.trim() === "") {
              toast.error(t('chat.noChat'));
              return;
            }
            if (chatExists(newChatNumber)) {
              toast.error(t('chat.chatAlreadyExists'));  // Fehlertoast, wenn der Chat bereits existiert
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

      </div>
      <div className="chat-list">
        {chats.map((chat) => {
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
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;
