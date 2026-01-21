import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Standard headers with auth token.
 */
const getConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`
    }
});

/**
 * Fetches the list of chats for a specific user.
 */
export const fetchChats = async ({ userId, page = 1, limit = 8, token }) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/chats/user/${userId}?page=${page}&limit=${limit}`,
            getConfig(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching chats:", error);
        throw error;
    }
};

/**
 * Fetches messages for a specific chat with offset pagination.
 */
export const openChat = async (chatId, userId, limit = 10, token, offset = 0) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/chats/${chatId}?offset=${offset}&limit=${limit}`,
            getConfig(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error opening chat:", error);
        throw error;
    }
};

// Keep old name for compatibility if needed elsewhere
export const fetchChatMessages = openChat;

/**
 * Sends a message in a chat.
 */
export const sendMessage = async ({ chatId, senderId, text, token }) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/chats/${chatId}/message`,
            { senderId, text },
            getConfig(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

/**
 * Creates a new chat between two participants.
 */
export const createChat = async ({ type, subjectNumber, participant1Id, participant2Id, orderId, productId, token }) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/chats/create`,
            { type, subjectNumber, participant1Id, participant2Id, orderId, productId },
            getConfig(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
};

/**
 * Marks messages in a chat as read. Supports granular IDs.
 */
export const markMessagesAsRead = async (chatId, userId, token, messageIds = []) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/chats/${chatId}/messages/read`,
            { userId, messageIds },
            getConfig(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error marking messages as read:", error);
        throw error;
    }
};

// Keep old name for compatibility
export const markAsRead = async ({ chatId, userId, token }) => markMessagesAsRead(chatId, userId, token);

/**
 * Fetches unread message count for a user.
 */
export const fetchUnreadCount = async ({ userId, token }) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/chats/unread/${userId}`,
            getConfig(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        throw error;
    }
};

/**
 * Fetches order details by number (used to check chat eligibility).
 */
export const fetchOrderByNumber = async (orderNumber, token) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/orders/number/${orderNumber}`,
            getConfig(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching order by number:", error);
        throw error;
    }
};
