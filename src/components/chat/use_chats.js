import { useState, useEffect } from "react";
import { fetchChats, openChat, sendMessage, loadMoreMessages, startNewChat, markMessagesAsRead } from "./chat_api";

export const useChats = (userId, partnerId, initialType, initialNumber) => {

  const [activeChat, setActiveChat] = useState(null);
  const [newChatType, setNewChatType] = useState(initialType);
  const [newChatNumber, setNewChatNumber] = useState(initialNumber);
  const [isNewChat, setIsNewChat] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isChatWindowActive, setIsChatWindowActive] = useState(false);
  const [isChatWindowHidden, setIsChatWindowHidden] = useState(false);
  const [getCurrentChatID, setCurrentChatID] = useState("");

  const [chats, setChats] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarCurrentPage, setSidebarCurrentPage] = useState(1); // Pagination für Sidebar
  const [chatWindowCurrentPage, setChatWindowCurrentPage] = useState(1); // Pagination für Chat-Fenster
  const PAGE_LIMIT = 5;


  const handleOpenChat = (chatId) => {
    setCurrentChatID(chatId);
    if (isMobile) {
      setIsSidebarHidden(true);
      setIsChatWindowHidden(false);
      setIsChatWindowActive(true);
    } else {
      setIsSidebarHidden(false);
      setIsChatWindowHidden(false);
    }
    setIsChatWindowActive(true);
  };

  useEffect(() => {
    if (isChatWindowActive) {
      openSelectedChat(getCurrentChatID);
    }
  }, [isChatWindowActive, getCurrentChatID]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      const role = localStorage.getItem("role");
      const sellerIdFromStorage = role === "seller" ? userId : partnerId;

      if (userId) {
        const data = await fetchChats(role, userId, sellerIdFromStorage, newChatType, sidebarCurrentPage);
        let currentChats = data.chats;

        // Check for initial chat from navigation (only on first load or when initialNumber changes)
        if (initialNumber && initialType) {
          const existingChat = currentChats.find(c => c.number === initialNumber && c.type === initialType);

          if (existingChat) {
            // If it exists, we just set it as active if it's not already
            if (activeChat?._id !== existingChat._id) {
              setActiveChat(existingChat);
              handleOpenChat(existingChat._id);
            }
          } else {
            // Create temp chat if it doesn't exist
            const tempId = "temp_" + Date.now();
            // Check if we already have this temp chat in state to avoid duplicates on re-renders
            const alreadyExists = chats.find(c => c.number === initialNumber && c.type === initialType && c._id.startsWith("temp_"));

            if (!alreadyExists) {
              const tempChat = {
                _id: tempId,
                type: initialType,
                number: initialNumber,
                updatedAt: new Date().toISOString(),
                messages: [],
                participants: [userId]
              };
              currentChats = [tempChat, ...currentChats];
              setActiveChat(tempChat);
              handleOpenChat(tempId);
            }
          }
        }

        setChats(currentChats);
        setTotalPages(data.totalPages);
      }
    };

    loadChats();
  }, [userId, partnerId, newChatType, sidebarCurrentPage, initialNumber, initialType]);

  const handlePageChange = (pageNumber) => {
    setSidebarCurrentPage(pageNumber);
  };


  const openSelectedChat = async (chatId) => {
    if (chatId.toString().startsWith("temp_")) {
      const tempChat = chats.find(c => c._id === chatId);
      if (tempChat) {
        setActiveChat(tempChat);
      }
      return;
    }

    setChatWindowCurrentPage(1);
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
    }
    else if (activeChat?._id && activeChat._id.toString().startsWith("temp_")) {
      const role = localStorage.getItem("role");
      try {
        let payloadUserId = userId;
        let payloadSellerId = partnerId;

        if (role === "seller") {
          payloadUserId = partnerId;
          payloadSellerId = userId;
        }

        const newChatData = await startNewChat(role, payloadUserId, payloadSellerId, activeChat.type, activeChat.number);

        const sentMessageData = await sendMessage(newChatData._id, userId, message);

        setActiveChat(sentMessageData);
        setChats(prev => prev.map(c => c._id === activeChat._id ? sentMessageData : c));
      } catch (err) {
        console.error("Error persisting temp chat:", err);
      }
    }
    else if (activeChat?._id) {
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

    if (!message || message.trim() === "") {
      const tempId = "temp_" + Date.now();
      const tempChat = {
        _id: tempId,
        type: newChatType,
        number: newChatNumber,
        updatedAt: new Date().toISOString(),
        messages: [],
        participants: [userId]
      };

      setChats(prev => {
        const newChats = [tempChat, ...prev];
        return newChats.slice(0, PAGE_LIMIT);
      });
      setActiveChat(tempChat);
      setIsNewChat(false);
      return;
    }

    try {
      let payloadUserId = userId;
      let payloadSellerId = partnerId;

      if (role === "seller") {
        payloadUserId = partnerId;
        payloadSellerId = userId;
      }

      const newChatData = await startNewChat(role, payloadUserId, payloadSellerId, newChatType, newChatNumber);
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
      const data = await loadMoreMessages(activeChat._id, chatWindowCurrentPage, PAGE_LIMIT);
      const newMessages = data.messages.filter(msg =>
        !activeChat.messages.some(existingMsg => existingMsg._id === msg._id)
      );
      setActiveChat(prev => ({ ...prev, messages: [...newMessages, ...prev.messages] }));
      setChatWindowCurrentPage(prev => prev + 1);
      if (data.messages.length < PAGE_LIMIT) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const handleBackToSidebar = () => {
    setIsSidebarHidden(false);
    setIsChatWindowHidden(true);
    setIsChatWindowActive(false);
  };

  return {
    chats,
    activeChat,
    openSelectedChat,
    newChatType,
    setNewChatType,
    newChatNumber,
    setNewChatNumber,
    isNewChat,
    setIsNewChat,
    newMessage,
    setNewMessage,
    sendNewMessage,
    startNewChatAndSendMessage,
    loadOlderMessages,
    hasMore,
    isLoadingOlder,
    isMobile,
    isSidebarHidden,
    setIsSidebarHidden,
    isChatWindowActive,
    handleOpenChat,
    handlePageChange,
    totalPages,
    sidebarCurrentPage,
    setSidebarCurrentPage,
    handleBackToSidebar



  };
};
