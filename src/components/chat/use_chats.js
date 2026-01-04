import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { fetchChats, openChat, sendMessage, loadMoreMessages, startNewChat, markMessagesAsRead, fetchOrderByNumber } from "./chat_api";
import { ORDER_STATUS } from "../utils/const/order_status";

export const useChats = (userId, partnerId, initialType, initialNumber) => {
  const { t } = useTranslation();

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
  const [isChatDisabled, setIsChatDisabled] = useState(false);

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
        const result = await fetchChats(role, userId, sellerIdFromStorage, newChatType, sidebarCurrentPage);
        if (result.success) {
          const data = result.data;
          let currentChats = data.chats;

          // Check for initial chat from navigation
          if (initialNumber && initialType) {
            const existingChat = currentChats.find(c => c.number === initialNumber && c.type === initialType);

            if (existingChat) {
              if (activeChat?._id !== existingChat._id) {
                setActiveChat(existingChat);
                handleOpenChat(existingChat._id);
              }
            } else {
              const tempId = "temp_" + Date.now();
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
        } else {
          toast.error(t(result.errorKey));
        }
      }
    };

    loadChats();
  }, [userId, partnerId, newChatType, sidebarCurrentPage, initialNumber, initialType]);

  const handlePageChange = (pageNumber) => {
    setSidebarCurrentPage(pageNumber);
  };


  const openSelectedChat = async (chatId) => {
    setIsChatDisabled(false); // Reset on open
    if (chatId.toString().startsWith("temp_")) {
      const tempChat = chats.find(c => c._id === chatId);
      if (tempChat) {
        setActiveChat(tempChat);
      }
      return;
    }

    setChatWindowCurrentPage(1);
    const result = await openChat(chatId, userId, PAGE_LIMIT);
    if (result.success) {
      const data = result.data;
      setActiveChat(data);
      const unreadMessages = data.messages.filter(m => m.senderId !== userId && !m.isRead);
      if (unreadMessages.length > 0) await markMessagesAsRead(chatId);
      setHasMore(data.messages.length === PAGE_LIMIT);
    } else {
      toast.error(t(result.errorKey));
    }
  };

  const sendNewMessage = async (message) => {
    if (!message.trim()) return;

    if (isNewChat) {
      await startNewChatAndSendMessage(message);
    }
    else if (activeChat?._id && activeChat._id.toString().startsWith("temp_")) {
      const role = localStorage.getItem("role");
      let payloadUserId = userId;
      let payloadSellerId = partnerId;

      if (role === "seller") {
        payloadUserId = partnerId;
        payloadSellerId = userId;
      }

      const chatResult = await startNewChat(role, payloadUserId, payloadSellerId, activeChat.type, activeChat.number);
      if (chatResult.success) {
        const msgResult = await sendMessage(chatResult.data._id, userId, message);
        if (msgResult.success) {
          setActiveChat(msgResult.data);
          setChats(prev => prev.map(c => c._id === activeChat._id ? msgResult.data : c));
        } else {
          toast.error(t(msgResult.errorKey));
        }
      } else {
        toast.error(t(chatResult.errorKey));
      }
    }
    else if (activeChat?._id) {
      const result = await sendMessage(activeChat._id, userId, message);
      if (result.success) {
        setActiveChat(result.data);
        setChats(prev => prev.map(c => c._id === result.data._id ? result.data : c));
        setNewMessage("");
      } else {
        toast.error(t(result.errorKey));
      }
    }
  };

  const startNewChatAndSendMessage = async (message) => {
    const role = localStorage.getItem("role");
    if (!userId) return toast.error(t("must_login"));

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

    let payloadUserId = userId;
    let payloadSellerId = partnerId;

    if (role === "seller") {
      payloadUserId = partnerId;
      payloadSellerId = userId;
    }

    const chatResult = await startNewChat(role, payloadUserId, payloadSellerId, newChatType, newChatNumber);
    if (chatResult.success) {
      setChats(prev => [chatResult.data, ...prev]);
      setActiveChat(chatResult.data);

      if (message.trim()) {
        const msgResult = await sendMessage(chatResult.data._id, userId, message);
        if (msgResult.success) {
          setActiveChat(msgResult.data);
          setChats(prev => prev.map(c => c._id === chatResult.data._id ? msgResult.data : c));
        } else {
          toast.error(t(msgResult.errorKey));
        }
      }
      setIsNewChat(false);
    } else {
      toast.error(t(chatResult.errorKey));
    }
  };

  const loadOlderMessages = async () => {
    if (!activeChat?._id || !hasMore) return;
    setIsLoadingOlder(true);
    const result = await loadMoreMessages(activeChat._id, chatWindowCurrentPage, PAGE_LIMIT);
    if (result.success) {
      const data = result.data;
      const newMessages = data.messages.filter(msg =>
        !activeChat.messages.some(existingMsg => existingMsg._id === msg._id)
      );
      setActiveChat(prev => ({ ...prev, messages: [...newMessages, ...prev.messages] }));
      setChatWindowCurrentPage(prev => prev + 1);
      if (data.messages.length < PAGE_LIMIT) setHasMore(false);
    } else {
      toast.error(t(result.errorKey));
    }
    setIsLoadingOlder(false);
  };

  useEffect(() => {
    const checkChatRestriction = async () => {
      if (activeChat?.type === "order" && activeChat.number) {
        const result = await fetchOrderByNumber(activeChat.number);
        if (result.success) {
          const order = result.data;
          const currentStatus = order.status[order.status.length - 1].update;
          const now = new Date();

          const deliveredStatus = order.status.find(s =>
            s.update === ORDER_STATUS.DELIVERED || s.update === ORDER_STATUS.PICKED_UP
          );

          let isExpired = false;
          if (deliveredStatus) {
            const deliveryDate = new Date(deliveredStatus.date);
            const diffHours = (now - deliveryDate) / (1000 * 60 * 60);

            if (currentStatus === ORDER_STATUS.PICKED_UP) {
              isExpired = true;
            } else if (currentStatus === ORDER_STATUS.DELIVERED && diffHours > 24) {
              isExpired = true;
            }
          }

          const activeReturnStatuses = [
            ORDER_STATUS.RETURN_REQUESTED,
            ORDER_STATUS.RETURN_CONFIRMED,
            ORDER_STATUS.RETURN_SHIPPED,
            ORDER_STATUS.RETURN_RECEIVED,
            ORDER_STATUS.RETURN_NOT_RECEIVED
          ];

          const isCancelled = currentStatus === ORDER_STATUS.CANCEL_USER || currentStatus === ORDER_STATUS.CANCEL_SELLER;
          const isNegativeFinal = [ORDER_STATUS.FAILED_DELIVERY, ORDER_STATUS.PICK_UP_FAILED, ORDER_STATUS.NO_RESPONSE].includes(currentStatus);

          if ((isExpired || isCancelled || isNegativeFinal) && !activeReturnStatuses.includes(currentStatus)) {
            setIsChatDisabled(true);
          } else {
            setIsChatDisabled(false);
          }
        }
      } else {
        setIsChatDisabled(false);
      }
    };

    checkChatRestriction();
  }, [activeChat]);

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
    handleBackToSidebar,
    isChatDisabled
  };
};
