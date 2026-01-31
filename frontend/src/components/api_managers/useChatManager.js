import { useState, useEffect, useMemo } from 'react';
import { useUserChats, useChatMessages, useSendMessage, useCreateChat, useUpdateReadStatus } from '../api_hooks/chat_hooks';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../../context/socket'; // Sicherstellen, dass der Pfad stimmt
import * as chatApi from '../api/chat_api';

export const useChatManager = (userId, token, initialPartnerId, initialChatType, initialSubjectNumber, initialMessage, initialOrderId, initialProductId) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

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

    // 1. Queries
    const { data: chatsData, isLoading: isLoadingChats } = useUserChats(userId, token, sidebarPage);
    const { data: messagesData, isLoading: isLoadingMessages, isFetching: isFetchingMessages } =
        useChatMessages(selectedChatId, token, fetchOffset, 10);



    // 2. Data Memos
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

    // 6. Actions (Müssen VOR useEffect definiert sein, da sie dort genutzt werden!)
    const handleMarkAsRead = (messageIds) => {
        if (!selectedChatId || !userId || !token || messageIds.length === 0) return;

        updateReadMutation.mutate({ chatId: selectedChatId, userId, token, messageIds }, {
            onSuccess: () => {
                // 1. Globalen Header-Counter updaten (hast du schon)
                queryClient.setQueryData(['user', String(userId)], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        unreadMessages: Math.max(0, (oldData.unreadMessages || 0) - messageIds.length)
                    };
                });

                // 2. NEU: Die Sidebar-Liste im Cache finden und den unreadCount dieses Chats auf 0 setzen
                queryClient.setQueryData(['chats', String(userId), sidebarPage], (oldData) => {
                    if (!oldData || !oldData.chats) return oldData;

                    return {
                        ...oldData,
                        chats: oldData.chats.map(chat => {
                            if (String(chat.id) === String(selectedChatId)) {
                                return {
                                    ...chat,
                                    unreadCount: 0 // Da der Chat offen ist, setzen wir ihn auf 0
                                };
                            }
                            return chat;
                        })
                    };
                });
            }
        });
    };

    // Hilfsfunktion zur Cache-Bereinigung (auslagern, damit sie überall genutzt werden kann)
    const updateCacheAfterRead = (chatId, countRemoved) => {
        // 1. Sidebar Counter auf 0
        queryClient.setQueryData(['chats', String(userId), sidebarPage], (oldData) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                chats: oldData.chats.map(c =>
                    String(c.id) === String(chatId) ? { ...c, unreadCount: 0 } : c
                )
            };
        });

        // 2. Globaler Header Counter minus X
        queryClient.setQueryData(['user', String(userId)], (oldData) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                unreadMessages: Math.max(0, (oldData.unreadMessages || 0) - countRemoved)
            };
        });
    };

    const handleSelectChat = async (chatId) => {
        setMessages([]);
        setFetchOffset(0);
        setSelectedChatId(chatId);
        setIsChatWindowActive(true);
        if (isMobile) setIsSidebarHidden(true);

        // NEU: Alle Nachrichten dieses Chats im Cache finden, die nicht von mir sind
        const chat = chats.find(c => String(c.id) === String(chatId));
        if (chat && chat.unreadCount > 0) {
            try {
                await updateReadMutation.mutateAsync({
                    chatId,
                    userId,
                    token,
                    all: true // Signal an das Backend: Alles in diesem Chat lesen
                });

                // Cache sofort bereinigen (Sidebar & Global)
                updateCacheAfterRead(chatId, chat.unreadCount);
            } catch (err) {
                console.error("Fehler beim massenweisen als gelesen markieren", err);
            }
        }
    };

    const handleSendMessage = async (text) => {
        const messageText = text || newMessage;
        if (!messageText.trim()) return;

        // Optimistisches Objekt für sofortige Anzeige
        const tempMsg = {
            id: Date.now(),
            senderId: userId,
            text: messageText,
            createdAt: new Date().toISOString(),
            sending: true
        };

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
                await chatApi.sendMessage({ chatId: newChat.id, senderId: userId, text: messageText, token });
                setSelectedChatId(newChat.id);
                setIsNewChat(false);
            } else {
                setMessages(prev => [...prev, tempMsg]); // Sofort anzeigen
                await sendMessageMutation.mutateAsync({ senderId: userId, text: messageText, token });
            }
            setNewMessage("");
        } catch (err) {
            toast.error(t("error_sending_message"));
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id)); // Bei Fehler entfernen
        }
    };

    const handleBackToSidebar = () => {
        setSelectedChatId(null);
        setIsNewChat(false);
        setIsChatWindowActive(false);
        setIsSidebarHidden(false);
    };

    // 7. Sync Side Effects
    useEffect(() => {
        if (messagesData?.messages) {
            const newMsgsFromApi = messagesData.messages;
            if (fetchOffset === 0) {
                setMessages(newMsgsFromApi);
            } else {
                setMessages(prev => {
                    const uniqueNew = newMsgsFromApi.filter(nm => !prev.some(m => m.id === nm.id));
                    return [...uniqueNew, ...prev];
                });
            }
            const totalOnServer = messagesData.totalMessages || 0;
            setHasMoreMessages(messages.length < totalOnServer);
        }
    }, [messagesData]);

    useEffect(() => {
        if (!socket || !userId) return;

        // A) Dem User-Raum beitreten (Pflicht!)
        socket.emit('join_private_room', userId);

        // B) Handler für den globalen Zähler (Header-Icon)
        const handleStatsUpdate = (newData) => {
            console.log("📩 Stats Update (vom DB-Trigger):", newData);

            // Update den globalen User-Zähler im Cache
            queryClient.setQueryData(['user', String(userId)], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    unreadMessages: newData.unreadMessages // Wert direkt aus der DB-Trigger-Payload
                };
            });

            // Sidebar Liste (Chats) als veraltet markieren -> lädt Vorschau-Text neu
            queryClient.invalidateQueries(['chats', String(userId)]);
        };

        // C) Handler für den echten Nachrichteninhalt (Live-Chat)
        const handleNewMessageContent = (data) => {
            console.log("📩 Neuer Nachrichteninhalt (vom Controller):", data);

            // Nur wenn der Chat gerade offen ist, die Nachricht in den State pushen
            if (selectedChatId && String(data.chatId) === String(selectedChatId)) {
                const incomingMsg = {
                    id: data.id,
                    text: data.text,
                    senderId: data.senderId,
                    createdAt: data.createdAt || new Date().toISOString(),
                    isRead: false
                };

                setMessages(prev => {
                    // Dubletten-Check: Verhindert doppelte Nachrichten
                    if (prev.some(m => m.id === incomingMsg.id)) return prev;
                    return [...prev, incomingMsg];
                });

                // Da der Nutzer die Nachricht gerade sieht: Sofort als gelesen markieren
                handleMarkAsRead([data.id]);
            }
        };

        // Events registrieren
        socket.on('stats_update', handleStatsUpdate);
        socket.on('new_message_content', handleNewMessageContent);

        // Aufräumen beim Schließen der Komponente
        return () => {
            socket.off('stats_update', handleStatsUpdate);
            socket.off('new_message_content', handleNewMessageContent);
        };
    }, [userId, selectedChatId, queryClient, handleMarkAsRead]);

    return {
        chats, messages, selectedChatId,
        activeChat: chats.find(c => String(c.id) === String(selectedChatId)),
        isNewChat,
        isLoadingChats, isLoadingMessages, isFetchingMessages,
        handleSelectChat, handleSendMessage, handleBackToSidebar,
        setIsNewChat, isMobile, isSidebarHidden, isChatWindowActive,
        newMessage, setNewMessage, sidebarPage, setSidebarPage,
        totalPages, hasMoreMessages,
        loadOlderMessages: () => { if (hasMoreMessages && !isFetchingMessages) setFetchOffset(messages.length); },
        handleMarkAsRead
    };
};