import { useState, useEffect } from "react";
import { fetchChats, openChat, sendMessage, loadMoreMessages, startNewChat, markMessagesAsRead } from "./chat_api";

export const useChats = (userId, sellerIdFromProps, initialType, initialNumber) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newChatType, setNewChatType] = useState(initialType);
  const [newChatNumber, setNewChatNumber] = useState(initialNumber);
  const [isNewChat, setIsNewChat] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const PAGE_LIMIT = 10;

  useEffect(() => {
    if (!userId) return;
    const role = localStorage.getItem("role");
    const sellerIdFromStorage = role === "seller" ? userId : sellerIdFromProps;

    fetchChats(role, userId, sellerIdFromStorage)
      .then(data => setChats(data))
      .catch(console.error);
  }, [userId]);

  const openSelectedChat = async (chatId) => {
    setCurrentPage(1);
    try {
      const data = await openChat(chatId, userId, PAGE_LIMIT);
      setActiveChat(data);
      const unreadMessages = data.messages.filter(m => m.senderId !== userId && !m.isRead);
      if (unreadMessages.length > 0) await markMessagesAsRead(chatId);
      setHasMore(data.messages.length === PAGE_LIMIT);
    } catch (err) {
      console.error(err);
    }
  };

  const sendNewMessage = async (message) => {
    if (!message.trim()) return;
    if (isNewChat) {
      await startNewChatAndSendMessage(message);
    } else if (activeChat?._id) {
      try {
        const data = await sendMessage(activeChat._id, userId, message);
        setActiveChat(data);
        setChats(prev => prev.map(c => c._id === data._id ? data : c));
      } catch (err) {
        console.error(err);
      }
      setNewMessage("");
    }
  };

  const startNewChatAndSendMessage = async (message) => {
    const role = localStorage.getItem("role");
    if (!userId) return alert("Kein User-Login gefunden!");
    try {
 
      const resolvedSellerId = sellerIdFromProps || (role === "seller" ? userId : null);


      const newChatData = await startNewChat(role, userId, resolvedSellerId, newChatType, newChatNumber);
      setChats(prev => [newChatData, ...prev]);
      setActiveChat(newChatData);

      if (message.trim()) {
        const sentMessageData = await sendMessage(newChatData._id, userId, message);
        setActiveChat(sentMessageData);
        setChats(prev => prev.map(c => c._id === newChatData._id ? sentMessageData : c));
      }
      setIsNewChat(false);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOlderMessages = async () => {
    if (!activeChat?._id || !hasMore) return;
    setIsLoadingOlder(true);
    try {
      const data = await loadMoreMessages(activeChat._id, currentPage, PAGE_LIMIT);
      const newMessages = data.messages.filter(msg => 
          !activeChat.messages.some(existingMsg => existingMsg._id === msg._id)
      );
      setActiveChat(prev => ({ ...prev, messages: [...newMessages, ...prev.messages] }));
      setCurrentPage(prev => prev + 1);
      if (data.messages.length < PAGE_LIMIT) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  return {
    chats, activeChat, openSelectedChat,
    newChatType, setNewChatType, newChatNumber, setNewChatNumber,
    isNewChat, setIsNewChat, 
    newMessage, setNewMessage,  
    sendNewMessage, startNewChatAndSendMessage,
    loadOlderMessages, currentPage, hasMore, isLoadingOlder
  };
};
