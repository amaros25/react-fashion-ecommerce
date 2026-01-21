import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '../api/chat_api';

/**
 * Hook to fetch all chats for a user.
 */
export const useUserChats = (userId, token, page = 1) => {
    return useQuery({
        queryKey: ['chats', userId, page],
        queryFn: () => chatApi.fetchChats({ userId, page, token }),
        enabled: !!userId && !!token,
        staleTime: 1000 * 30, // 30 seconds
    });
};

/**
 * Hook to fetch messages for a specific chat.
 */
export const useChatMessages = (chatId, token, offset = 0, limit = 10) => {
    return useQuery({
        queryKey: ['chat-messages', chatId, offset, limit],
        queryFn: () => chatApi.openChat(chatId, null, limit, token, offset),
        enabled: !!chatId && !!token,
        staleTime: 0, // Always fresh for messages
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
            queryClient.invalidateQueries({ queryKey: ['chats'] }); // Update list summary
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
            queryClient.invalidateQueries({ queryKey: ['chats'] });
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
        refetchInterval: 1000 * 60, // Poll every minute
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
            const { affectedCount } = data;

            // Targeted update for user unread count to avoid full re-fetch
            queryClient.setQueryData(['user', variables.userId], (oldUser) => {
                if (!oldUser) return oldUser;
                const currentUnread = oldUser.unreadMessages || 0;
                return {
                    ...oldUser,
                    unreadMessages: Math.max(0, currentUnread - (affectedCount || 0))
                };
            });

            queryClient.invalidateQueries({ queryKey: ['unread-count', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['chats', variables.userId] });
        },
    });
};
