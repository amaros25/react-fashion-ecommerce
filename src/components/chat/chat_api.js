export const fetchChats = async (role, userId, sellerId) => {
  try {
    let url = '';
    if (role === "admin") {
      url = `http://localhost:5000/api/chats/user/${userId}?role=admin`;
    } else {
      url = role === "seller"
        ? `http://localhost:5000/api/chats/seller/${sellerId}?role=seller`
        : `http://localhost:5000/api/chats/user/${userId}?role=user`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Fehler beim Laden der Chats:", err);
    throw err;
  }
};

export const openChat = async (chatId, userId, PAGE_LIMIT) => {
  try {
    const res = await fetch(`http://localhost:5000/api/chats/${chatId}?page=1&limit=${PAGE_LIMIT}`);
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
    const res = await fetch(`http://localhost:5000/api/chats/${chatId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fehler beim Senden der Nachricht", err);
    throw err;
  }
};

export const loadMoreMessages = async (chatId, currentPage, PAGE_LIMIT) => {
  try {
    const nextPage = currentPage + 1;
    const res = await fetch(
      `http://localhost:5000/api/chats/${chatId}?page=${nextPage}&limit=${PAGE_LIMIT}`
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
    
    if (!newChatType) throw new Error("Bitte chattype eingeben!");
    if (!number.trim()) throw new Error("Bitte Nummer eingeben!");

    const payload = {
      type: newChatType,
      number: number,
    };

    if (sellerId) {
      payload.sellerId = sellerId;
    }else{
      payload.chatWith = "admin";
    }

    if (userId) {
      payload.userId = userId;
    }else{
      payload.chatWith = "admin";
    }

    const res = await fetch("http://localhost:5000/api/chats/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Fehler beim Erstellen des Chats");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fehler beim Erstellen des Chats", err);
    throw err;
  }
};

export const markMessagesAsRead = async (chatId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/chats/${chatId}/messages/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Fehler beim Markieren der Nachrichten als gelesen");

    const updatedChat = await res.json();
    return updatedChat;
  } catch (err) {
    console.error("Fehler beim Markieren der Nachrichten als gelesen:", err);
    throw err;
  }
};
