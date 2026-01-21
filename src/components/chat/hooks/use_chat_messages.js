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
    const [loadedMessagesCount, setLoadedMessagesCount] = useState(0);
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
            const tempChat = chatsRef.current.find(c => c.id === chatId);
            if (tempChat) setActiveChat(tempChat);
            return;
        }

        const result = await openChat(chatId, userId, PAGE_LIMIT, token);
        if (result.success) {
            const data = result.data;
            setActiveChat(data);
            setLoadedMessagesCount(data.loadedMessagesCount || data.messages.length);
            setHasMore((data.loadedMessagesCount || data.messages.length) < data.totalMessages);
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
        if (activeChat.id.toString().startsWith("temp_")) {
            let payloadUserId = role === "seller" ? partnerId : userId;
            let payloadSellerId = role === "seller" ? userId : partnerId;

            const chatResult = await startNewChat(role, payloadUserId, payloadSellerId, activeChat.type, activeChat.subjectNumber, token);

            if (chatResult.success) {
                const msgResult = await sendMessage(chatResult.data.id, userId, message, token);
                if (msgResult.success) {
                    const newMsg = msgResult.data;
                    setActiveChat(prev => ({
                        ...prev,
                        ...chatResult.data, // Take fresh chat metadata
                        messages: [newMsg] // First message in new chat
                    }));
                    // Replace temp chat in the list with the real one
                    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...chatResult.data, messages: [newMsg] } : c));
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
            const result = await sendMessage(activeChat.id, userId, message, token);
            if (result.success) {
                const newMsg = result.data;
                setActiveChat(prev => ({
                    ...prev,
                    messages: [...(prev.messages || []), newMsg],
                    lastMessage: newMsg.text,
                    updatedAt: newMsg.createdAt
                }));
                // Update chat list to reflect latest message/timestamp
                setChats(prev => prev.map(c => {
                    if (c.id === activeChat.id || c._id === activeChat.id) {
                        return {
                            ...c,
                            lastMessage: newMsg.text,
                            updatedAt: newMsg.createdAt,
                            messages: [...(c.messages || []), newMsg]
                        };
                    }
                    return c;
                }));
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
        if (!activeChat?.id || !hasMore || isLoadingOlder) return;

        setIsLoadingOlder(true);
        const result = await loadMoreMessages(activeChat.id, loadedMessagesCount, PAGE_LIMIT, token);

        if (result.success) {
            const data = result.data;
            const newMessages = data.messages.filter(msg =>
                !activeChat.messages.some(existingMsg => (existingMsg.id || existingMsg._id) === (msg.id || msg._id))
            );

            setActiveChat(prev => ({
                ...prev,
                messages: [...newMessages, ...prev.messages]
            }));

            setLoadedMessagesCount(data.loadedMessagesCount);
            setHasMore(data.loadedMessagesCount < data.totalMessages);
        } else {
            toast.error(t(result.errorKey));
        }
        setIsLoadingOlder(false);
    }, [activeChat, hasMore, isLoadingOlder, loadedMessagesCount, token, t]);

    return useMemo(() => ({
        activeChat,
        setActiveChat,
        newMessage,
        setNewMessage,
        hasMore,
        isLoadingOlder,
        loadedMessagesCount,
        currentChatID,
        setCurrentChatID,
        openSelectedChat,
        handleSendNewMessage,
        loadOlderMessages
    }), [activeChat, newMessage, hasMore, isLoadingOlder, currentChatID, openSelectedChat, handleSendNewMessage, loadOlderMessages]);
};
