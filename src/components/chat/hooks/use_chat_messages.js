import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { openChat, sendMessage, loadMoreMessages, startNewChat, markMessagesAsRead } from "../chat_api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

/**
 * Hook to manage messages within an active chat.
 * Handles fetching chat details, sending messages, and pagination of history.
 */
export const useChatMessages = (userId, token, setChats, chats) => {
    const { t } = useTranslation();
    const PAGE_LIMIT = 5;

    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [chatWindowCurrentPage, setChatWindowCurrentPage] = useState(1);
    const [currentChatID, setCurrentChatID] = useState("");

    // Use a ref for chats to keep callbacks stable and avoid infinite loops
    const chatsRef = useRef(chats);
    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    /**
     * Loads the details of a selected chat.
     */
    const openSelectedChat = useCallback(async (chatId) => {
        if (!chatId) return;

        // If it's a temporary chat, just find it in the list and set as active
        if (chatId.toString().startsWith("temp_")) {
            const tempChat = chatsRef.current.find(c => c._id === chatId);
            if (tempChat) setActiveChat(tempChat);
            return;
        }

        setChatWindowCurrentPage(1);
        if (!userId || !token) return;

        const result = await openChat(chatId, userId, PAGE_LIMIT, token);
        if (result.success) {
            const data = result.data;
            setActiveChat(data);

            // Mark as read if there are unread messages from the partner
            const unreadMessages = data.messages.filter(m => m.senderId !== userId && !m.isRead);
            if (unreadMessages.length > 0) await markMessagesAsRead(chatId, token);

            setHasMore(data.messages.length === PAGE_LIMIT);
        } else {
            toast.error(t(result.errorKey));
        }
    }, [userId, token, t]);

    /**
     * Action to send a new message. Handles temporary chat persistence.
     */
    const handleSendNewMessage = useCallback(async (message, partnerId) => {
        if (!message.trim() || !activeChat) return;

        const role = localStorage.getItem("role");

        // Case 1: Active chat is temporary - create it first
        if (activeChat._id.toString().startsWith("temp_")) {
            let payloadUserId = role === "seller" ? partnerId : userId;
            let payloadSellerId = role === "seller" ? userId : partnerId;

            const chatResult = await startNewChat(role, payloadUserId, payloadSellerId, activeChat.type, activeChat.number, token);

            if (chatResult.success) {
                const msgResult = await sendMessage(chatResult.data._id, userId, message, token);
                if (msgResult.success) {
                    setActiveChat(msgResult.data);
                    // Replace temp chat in the list with the real one
                    setChats(prev => prev.map(c => c._id === activeChat._id ? msgResult.data : c));
                    setNewMessage("");
                } else {
                    toast.error(t(msgResult.errorKey));
                }
            } else {
                toast.error(t(chatResult.errorKey));
            }
        }
        // Case 2: Standard existing chat
        else {
            const result = await sendMessage(activeChat._id, userId, message, token);
            if (result.success) {
                setActiveChat(result.data);
                // Update chat list to reflect latest message/timestamp
                setChats(prev => prev.map(c => c._id === result.data._id ? result.data : c));
                setNewMessage("");
            } else {
                toast.error(t(result.errorKey));
            }
        }
    }, [activeChat, userId, token, setChats, t]);

    /**
     * Loads older messages (message pagination).
     */
    const loadOlderMessages = useCallback(async () => {
        if (!activeChat?._id || !hasMore || isLoadingOlder) return;

        setIsLoadingOlder(true);
        const result = await loadMoreMessages(activeChat._id, chatWindowCurrentPage, PAGE_LIMIT, token);

        if (result.success) {
            const data = result.data;
            // Filter out messages we already have (just in case)
            const newMessages = data.messages.filter(msg =>
                !activeChat.messages.some(existingMsg => existingMsg._id === msg._id)
            );

            setActiveChat(prev => ({
                ...prev,
                messages: [...newMessages, ...prev.messages]
            }));

            setChatWindowCurrentPage(prev => prev + 1);
            if (data.messages.length < PAGE_LIMIT) setHasMore(false);
        } else {
            toast.error(t(result.errorKey));
        }
        setIsLoadingOlder(false);
    }, [activeChat, hasMore, isLoadingOlder, chatWindowCurrentPage, token, t]);

    return useMemo(() => ({
        activeChat,
        setActiveChat,
        newMessage,
        setNewMessage,
        hasMore,
        isLoadingOlder,
        currentChatID,
        setCurrentChatID,
        openSelectedChat,
        handleSendNewMessage,
        loadOlderMessages
    }), [activeChat, newMessage, hasMore, isLoadingOlder, currentChatID, openSelectedChat, handleSendNewMessage, loadOlderMessages]);
};
