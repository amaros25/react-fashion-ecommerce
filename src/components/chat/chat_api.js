const apiUrl = process.env.REACT_APP_API_URL;
export const fetchChats = async (role, userId, sellerId, newChatType, currentPage) => {
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

    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (err) {
    console.error("Error loading chats:", err);
    throw err;
  }
};


export const openChat = async (chatId, userId, PAGE_LIMIT) => {
  try {
    const res = await fetch(`${apiUrl}/chats/${chatId}?page=1&limit=${PAGE_LIMIT}`);
    const data = await res.json();

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const sendMessage = async (chatId, userId, newMessage) => {
  try {
    const payload = { senderId: userId, text: newMessage, isRead: false };
    const res = await fetch(`${apiUrl}/chats/${chatId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error sending message", err);
    throw err;
  }
};

export const loadMoreMessages = async (chatId, currentPage, PAGE_LIMIT) => {
  try {
    const nextPage = currentPage + 1;
    const res = await fetch(
      `${apiUrl}/chats/${chatId}?page=${nextPage}&limit=${PAGE_LIMIT}`
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const startNewChat = async (role, userId, sellerId, newChatType, number) => {
  try {

    if (!newChatType) throw new Error("Please enter chat type!");
    if (!number.trim()) throw new Error("Please enter number!");

    const payload = {
      type: newChatType,
      number: number,
    };

    if (sellerId) {
      payload.sellerId = sellerId;
    } else {
      payload.chatWith = "admin";
    }

    if (userId) {
      payload.userId = userId;
    } else {
      payload.chatWith = "admin";
    }

    const res = await fetch(`${apiUrl}/chats/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error creating chat");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error creating chat", err);
    throw err;
  }
};

export const markMessagesAsRead = async (chatId) => {
  try {
    const res = await fetch(`${apiUrl}/chats/${chatId}/messages/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Error marking messages as read");

    const updatedChat = await res.json();
    return updatedChat;
  } catch (err) {
    console.error("Error marking messages as read:", err);
    throw err;
  }
};

export const fetchOrderByNumber = async (orderNumber) => {
  try {
    const res = await fetch(`${apiUrl}/orders/number/${orderNumber}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching order:", err);
    return null;
  }
};
