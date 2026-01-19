const apiUrl = process.env.REACT_APP_API_URL;

/**
 * Helper to get default headers for API requests.
 */
const getHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/**
 * Fetches the list of chats for a specific user/role with pagination.
 */
export const fetchChats = async (role, userId, sellerId, newChatType, currentPage, token, signal = null) => {
  try {
    console.log("Fetching chats for role:", role, userId, sellerId, newChatType, currentPage, token, signal);
    const limit = 8;
    let url = '';

    // Determine the correct endpoint based on the user's role
    // In the PostgreSQL backend, /chats/user/:userId is the unified endpoint for both users and sellers
    // because participants are stored as participant1Id and participant2Id
    url = `${apiUrl}/chats/user/${userId}?page=${currentPage}&limit=${limit}`;

    const response = await fetch(url, {
      headers: getHeaders(token),
      signal
    });
    const data = await response.json();

    return response.ok
      ? { success: true, data }
      : { success: false, errorKey: data.message || "server_error" };
  } catch (err) {
    if (err.name === 'AbortError') return { success: false, aborted: true };
    console.error("Error loading chats:", err);
    return { success: false, errorKey: "server_error" };
  }
};

/**
 * Fetches full details and messages for a specific chat.
 */
export const openChat = async (chatId, userId, PAGE_LIMIT, token) => {
  try {
    const res = await fetch(`${apiUrl}/chats/${chatId}?page=1&limit=${PAGE_LIMIT}`, {
      headers: getHeaders(token),
    });
    const data = await res.json();

    return res.ok
      ? { success: true, data }
      : { success: false, errorKey: data.message || "server_error" };
  } catch (err) {
    console.error("Error opening chat:", err);
    return { success: false, errorKey: "server_error" };
  }
};

/**
 * Sends a new message in an existing chat.
 */
export const sendMessage = async (chatId, userId, newMessage, token) => {
  try {
    const payload = { senderId: userId, text: newMessage, isRead: false };
    const res = await fetch(`${apiUrl}/chats/${chatId}/message`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    return res.ok
      ? { success: true, data }
      : { success: false, errorKey: data.message || "server_error" };
  } catch (err) {
    console.error("Error sending message", err);
    return { success: false, errorKey: "server_error" };
  }
};

/**
 * Loads older messages for a chat (pagination).
 */
export const loadMoreMessages = async (chatId, currentPage, PAGE_LIMIT, token) => {
  try {
    const nextPage = currentPage + 1;
    const res = await fetch(
      `${apiUrl}/chats/${chatId}?page=${nextPage}&limit=${PAGE_LIMIT}`,
      { headers: getHeaders(token) }
    );
    const data = await res.json();

    return res.ok
      ? { success: true, data }
      : { success: false, errorKey: data.message || "server_error" };
  } catch (err) {
    console.error("Error loading more messages:", err);
    return { success: false, errorKey: "server_error" };
  }
};

/**
 * Persists a new chat in the database.
 */
export const startNewChat = async (role, userId, sellerId, newChatType, number, token) => {
  try {
    if (!newChatType || !number?.trim()) return { success: false, errorKey: "missing_data" };

    const payload = {
      type: newChatType,
      subjectNumber: number, // In PostgreSQL it is subjectNumber
      participant1Id: userId || 1, // Participant1 is usually the user/buyer
      participant2Id: sellerId || 1 // Participant2 is usually the seller
    };

    // If it's an order chat, we also pass the orderId explicitly if possible
    // (In current logic, number often is the order number)
    if (newChatType === "order") {
      // payload.orderId = ...
    }

    const res = await fetch(`${apiUrl}/chats/create`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return res.ok
      ? { success: true, data }
      : { success: false, errorKey: data.message || "server_error" };
  } catch (err) {
    console.error("Error creating chat", err);
    return { success: false, errorKey: "server_error" };
  }
};

/**
 * Updates all messages in a chat as 'read' for the current user.
 */
export const markMessagesAsRead = async (chatId, userId, token) => {
  try {
    const res = await fetch(`${apiUrl}/chats/${chatId}/messages/read`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify({ userId }) // PostgreSQL expects userId to know who is reading
    });

    const data = await res.json();
    return res.ok
      ? { success: true, data }
      : { success: false, errorKey: data.message || "server_error" };
  } catch (err) {
    console.error("Error marking messages as read:", err);
    return { success: false, errorKey: "server_error" };
  }
};

/**
 * Fetches order details by order number to check chat eligibility.
 */
export const fetchOrderByNumber = async (orderNumber, token) => {
  try {
    const res = await fetch(`${apiUrl}/orders/number/${orderNumber}`, {
      headers: getHeaders(token),
    });
    const data = await res.json();

    return res.ok
      ? { success: true, data }
      : { success: false, errorKey: data.message || "server_error" };
  } catch (err) {
    console.error("Error fetching order:", err);
    return { success: false, errorKey: "server_error" };
  }
};
