const apiUrl = process.env.REACT_APP_API_URL;

export const fetchChats = async (role, userId, sellerId, newChatType, currentPage, token) => {
  try {
    let url = '';
    const limit = 5;
    if (role === "admin") {
      url = `${apiUrl}/chats/user/${userId}?role=admin&page=${currentPage}&limit=${limit}`;
    } else {
      url = role === "seller"
        ? `${apiUrl}/chats/seller/${sellerId}?role=seller&page=${currentPage}&limit=${limit}`
        : `${apiUrl}/chats/user/${userId}?role=user&page=${currentPage}&limit=${limit}`;
    }

    const response = await fetch(url, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, errorKey: data.message || "server_error" };
    }
  } catch (err) {
    console.error("Error loading chats:", err);
    return { success: false, errorKey: "server_error" };
  }
};

export const openChat = async (chatId, userId, PAGE_LIMIT, token) => {
  try {
    const res = await fetch(`${apiUrl}/chats/${chatId}?page=1&limit=${PAGE_LIMIT}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    const data = await res.json();

    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, errorKey: data.message || "server_error" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, errorKey: "server_error" };
  }
};

export const sendMessage = async (chatId, userId, newMessage, token) => {
  try {
    const payload = { senderId: userId, text: newMessage, isRead: false };
    const res = await fetch(`${apiUrl}/chats/${chatId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, errorKey: data.message || "server_error" };
    }
  } catch (err) {
    console.error("Error sending message", err);
    return { success: false, errorKey: "server_error" };
  }
};

export const loadMoreMessages = async (chatId, currentPage, PAGE_LIMIT, token) => {
  try {
    const nextPage = currentPage + 1;
    const res = await fetch(
      `${apiUrl}/chats/${chatId}?page=${nextPage}&limit=${PAGE_LIMIT}`,
      {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      }
    );
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, errorKey: data.message || "server_error" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, errorKey: "server_error" };
  }
};

export const startNewChat = async (role, userId, sellerId, newChatType, number, token) => {
  try {
    if (!newChatType || !number?.trim()) return { success: false, errorKey: "missing_data" };

    const payload = {
      type: newChatType,
      number: number,
      userId: userId || "admin",
      sellerId: sellerId || "admin"
    };

    const res = await fetch(`${apiUrl}/chats/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, errorKey: data.message || "server_error" };
    }
  } catch (err) {
    console.error("Error creating chat", err);
    return { success: false, errorKey: "server_error" };
  }
};

export const markMessagesAsRead = async (chatId, token) => {
  try {
    const res = await fetch(`${apiUrl}/chats/${chatId}/messages/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, errorKey: data.message || "server_error" };
    }
  } catch (err) {
    console.error("Error marking messages as read:", err);
    return { success: false, errorKey: "server_error" };
  }
};

export const fetchOrderByNumber = async (orderNumber, token) => {
  try {
    const res = await fetch(`${apiUrl}/orders/number/${orderNumber}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, errorKey: data.message || "server_error" };
    }
  } catch (err) {
    console.error("Error fetching order:", err);
    return { success: false, errorKey: "server_error" };
  }
};
