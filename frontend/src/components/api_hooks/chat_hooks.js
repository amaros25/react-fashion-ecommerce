import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '../api/chat_api';

/**
 * Hook to fetch all chats for a user.
 */
// Empfohlene Struktur in chat_hooks.js
export const CHAT_KEYS = {
    chats: (userId, page) => ['chats', String(userId), page],
    messages: (chatId) => ['chat-messages', chatId, 0, 10], // Wir nutzen den hardcoded Key des Users, machen ihn aber variabel
};

export const useUserChats = (userId, token, page = 1) => {
    return useQuery({
        queryKey: ['chats', userId, page],
        queryFn: () => chatApi.fetchChats({ userId, page, token }),
        enabled: !!userId && !!token,
        staleTime: Infinity,
        placeholderData: (previousData) => previousData,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        gcTime: 1000 * 60 * 30,
    });
};

/**
 * Hook to fetch messages for a specific chat.
 */
export const useChatMessages = (chatId, token, offset = 0, limit = 10) => {
    return useQuery({
        queryKey: ['chat-messages', chatId, offset, limit],
        queryFn: () => chatApi.openChat(chatId, null, limit, token, offset),
        enabled: !!chatId && !!token && chatId !== 'new-chat-temp',
        staleTime: Infinity,
        refetchInterval: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

/**
 * Hook to send a message.
 */
export const useSendMessage = (chatId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ senderId, text, token }) =>
            chatApi.sendMessage({ chatId, senderId, text, token }),

        onSuccess: (newMessageFromServer) => {
            // Wir aktualisieren den Cache für 'chat-messages' manuell
            queryClient.setQueryData(['chat-messages', chatId, 0, 10], (oldData) => {
                if (!oldData) return oldData;

                // Wir fügen die neue Nachricht (das Echo) einfach an das Ende des Arrays an
                return {
                    ...oldData,
                    messages: [...oldData.messages, newMessageFromServer],
                    totalMessages: (oldData.totalMessages || 0) + 1
                };
            });

            // Optional: Auch die Sidebar aktualisieren, damit dort die letzte Nachricht steht
            // ohne ein GET /chats auszulösen
            queryClient.setQueryData(['chats', newMessageFromServer.senderId, 1], (oldSidebarData) => {
                if (!oldSidebarData) return oldSidebarData;
                return {
                    ...oldSidebarData,
                    chats: oldSidebarData.chats.map(chat =>
                        chat.id === chatId
                            ? { ...chat, messages: [newMessageFromServer], updatedAt: newMessageFromServer.createdAt }
                            : chat
                    )
                };
            });
        },
    });
};

/**
 * Hook to create a new chat.
 */
export const useCreateChat = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables) => chatApi.createChat(variables),
        onSuccess: () => {
            //queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
    });
};

/**
 * Hook to fetch unread count.
 */
export const useUnreadCount = (userId, token) => {
    return useQuery({
        queryKey: ['unread-count', userId],
        queryFn: () => chatApi.fetchUnreadCount({ userId, token }),
        enabled: !!userId && !!token,
        refetchInterval: Infinity,
    });
};
/**
 * Hook to mark messages in a chat as read.
 */

export const useUpdateReadStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ chatId, userId, token, messageIds }) =>
            chatApi.markMessagesAsRead(chatId, userId, token, messageIds),
        onSuccess: (data, variables) => {
            // 1. Sidebar gezielt updaten (RICHTIGER KEY: 'chats')
            queryClient.setQueryData(['chats', variables.userId, 1], (oldData) => {
                if (!oldData || !oldData.chats) return oldData;
                return {
                    ...oldData,
                    chats: oldData.chats.map(chat =>
                        chat.id === variables.chatId
                            ? { ...chat, unreadCount: 0 }
                            : chat
                    )
                };
            });

            // 2. Unread Count manuell dekrementieren statt Invalidate
            queryClient.setQueryData(['unread-count', variables.userId], (oldCount) => {
                if (typeof oldCount !== 'number') return 0;
                return Math.max(0, oldCount - (data.affectedCount || 0));
            });

            // 3. Nachrichten-Cache updaten, um den Loop zu stoppen
            queryClient.setQueriesData({ queryKey: ['chat-messages', variables.chatId] }, (oldData) => {
                if (!oldData || !oldData.messages) return oldData;
                return {
                    ...oldData,
                    messages: oldData.messages.map(m => {
                        if (variables.messageIds.length > 0) {
                            // Wenn spezifische IDs gelesene wurden
                            return variables.messageIds.includes(String(m.id)) ? { ...m, isRead: true } : m;
                        } else if (variables.all) {
                            // Wenn "all" gesetzt ist (z.B. beim Öffnen)
                            return { ...m, isRead: true };
                        }
                        return m;
                    })
                };
            });
        },
    });
};
