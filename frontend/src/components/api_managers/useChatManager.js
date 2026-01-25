import { useState, useEffect, useMemo } from 'react';
import { useUserChats, useChatMessages, useSendMessage, useCreateChat, useUpdateReadStatus } from '../api_hooks/chat_hooks';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import * as chatApi from '../api/chat_api';

/**
 * Manager to handle Chat logic: sidebar, window active state, mobile responsiveness,
 * pagination for both chats and messages, and message sending.
 */
export const useChatManager = (userId, token, initialPartnerId, initialChatType, initialSubjectNumber, initialMessage, initialOrderId, initialProductId) => {
    const { t } = useTranslation();
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [isNewChat, setIsNewChat] = useState(false);
    const [sidebarPage, setSidebarPage] = useState(1);
    const [fetchOffset, setFetchOffset] = useState(0);
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    const [isChatWindowActive, setIsChatWindowActive] = useState(false);
    const [newMessage, setNewMessage] = useState(initialMessage || "");

    const isMobile = window.innerWidth <= 768;

    // 1. Fetch Chat List
    const { data: chatsData, isLoading: isLoadingChats } = useUserChats(userId, token, sidebarPage);

    const { data: messagesData, isLoading: isLoadingMessages, isFetching: isFetchingMessages } =
        useChatMessages(selectedChatId, token, fetchOffset, 10);

    useEffect(() => {
        if (messagesData?.messages) {
            const newMsgsFromApi = messagesData.messages;
            if (fetchOffset === 0) {

                setMessages(newMsgsFromApi);
            } else {
                setMessages(prev => {
                    const uniqueNew = newMsgsFromApi.filter(
                        nm => !prev.some(m => m.id === nm.id)
                    );
                    return [...uniqueNew, ...prev];
                });
            }
            // Correctly determine if more older messages exist on the server
            const totalOnServer = messagesData.totalMessages || 0;
            setHasMoreMessages(newMsgsFromApi.length + fetchOffset < totalOnServer);
        }
    }, [messagesData]);

    const activeChat = messagesData || null;

    // 3. Construct Virtual Chat for New Chat State (Sidebar)
    const chats = useMemo(() => {
        let list = chatsData?.chats || [];
        if (isNewChat && !selectedChatId) {
            const virtualChat = {
                id: 'new-chat-temp',
                type: initialChatType || 'support',
                subjectNumber: initialSubjectNumber || 'General',
                otherParticipant: { name: t('chat.newConversation') || 'New Conversation' },
                messages: [],
                updatedAt: new Date().toISOString(),
                isNewTemp: true
            };
            return [virtualChat, ...list];
        }
        return list;
    }, [chatsData, isNewChat, selectedChatId, initialChatType, initialSubjectNumber, t]);

    const totalPages = chatsData?.totalPages || 1;

    // 3. Mutations
    const sendMessageMutation = useSendMessage(selectedChatId);
    const createChatMutation = useCreateChat();
    const updateReadMutation = useUpdateReadStatus();

    // 4. Mark messages as read is now handled granularly in ChatWindow UI

    // Handle initial chat request (from Order/Product page)
    useEffect(() => {
        if (!userId || !token || !initialSubjectNumber) return;

        const checkExistingChat = () => {
            const existing = chats.find(c =>
                c.subjectNumber === initialSubjectNumber &&
                ((c.participant1Id == userId && c.participant2Id == (initialPartnerId || 1)) ||
                    (c.participant1Id == (initialPartnerId || 1) && c.participant2Id == userId)) &&
                (!initialOrderId || c.orderId == initialOrderId) &&
                (!initialProductId || c.productId == initialProductId)
            );

            if (existing) {
                setSelectedChatId(existing.id);
                setIsChatWindowActive(true);
                if (isMobile) setIsSidebarHidden(true);
            } else if (initialMessage || initialChatType) {
                setIsNewChat(true);
                setIsChatWindowActive(true);
                if (isMobile) setIsSidebarHidden(true);
            }
        };

        checkExistingChat();
    }, [chats, initialPartnerId, initialSubjectNumber, userId, token, initialMessage, initialChatType, isMobile]);

    const handleSelectChat = (chatId) => {
        setSelectedChatId(chatId);
        setIsNewChat(false);
        setIsChatWindowActive(true);
        if (isMobile) setIsSidebarHidden(true);
        if (selectedChatId !== chatId) {
            setFetchOffset(0);
            setMessages([]);
            setHasMoreMessages(true);
        }
    };

    const handleSendMessage = async (text) => {
        const messageText = text || newMessage;
        if (!messageText.trim()) return;

        try {
            if (isNewChat) {
                const newChat = await createChatMutation.mutateAsync({
                    type: initialChatType || 'support',
                    subjectNumber: initialSubjectNumber || 'General',
                    participant1Id: userId,
                    participant2Id: initialPartnerId || 1,
                    orderId: initialOrderId,
                    productId: initialProductId,
                    token
                });

                await chatApi.sendMessage({
                    chatId: newChat.id,
                    senderId: userId,
                    text: messageText,
                    token
                });

                setSelectedChatId(newChat.id);
                setIsNewChat(false);
                setNewMessage("");
            } else if (selectedChatId) {
                await sendMessageMutation.mutateAsync({
                    senderId: userId,
                    text: messageText,
                    token
                });
                setNewMessage("");
            }
        } catch (err) {
            toast.error(t("error_sending_message"));
        }
    };

    const handleBackToSidebar = () => {
        setSelectedChatId(null);
        setIsNewChat(false);
        setIsChatWindowActive(false);
        setIsSidebarHidden(false);
    };

    return {
        chats,
        messages,
        activeChat,
        selectedChatId,
        isNewChat,
        isLoadingChats,
        isLoadingMessages,
        isFetchingMessages,
        handleSelectChat,
        handleSendMessage,
        handleBackToSidebar,
        setIsNewChat,
        // UI
        isMobile,
        isSidebarHidden,
        isChatWindowActive,
        newMessage,
        setNewMessage,
        // Pagination & State
        sidebarPage,
        setSidebarPage,
        totalPages,
        hasMoreMessages,
        loadOlderMessages: () => {
            if (hasMoreMessages && !isFetchingMessages) {
                setFetchOffset(messages.length);
            }
        },
        handleMarkAsRead: (messageIds) => {
            if (selectedChatId && userId && token) {
                updateReadMutation.mutate({ chatId: selectedChatId, userId, token, messageIds });
            }
        }
    };
};
