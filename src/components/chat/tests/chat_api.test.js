import {
    fetchChats,
    openChat,
    sendMessage,
    loadMoreMessages,
    startNewChat,
    markMessagesAsRead,
} from "../chat_api";

// Mock global fetch
global.fetch = jest.fn();

describe("chat_api", () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe("fetchChats", () => {
        it("should fetch chats for admin", async () => {
            const mockData = { chats: [], totalPages: 1 };
            fetch.mockResolvedValueOnce({
                json: async () => mockData,
            });

            const result = await fetchChats("admin", "user123", null, "product", 1);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/chats/user/user123?role=admin")
            );
            expect(result).toEqual(mockData);
        });

        it("should fetch chats for seller", async () => {
            const mockData = { chats: [], totalPages: 1 };
            fetch.mockResolvedValueOnce({
                json: async () => mockData,
            });

            const result = await fetchChats("seller", "user123", "seller123", "product", 1);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/chats/seller/seller123?role=seller")
            );
            expect(result).toEqual(mockData);
        });

        it("should fetch chats for user", async () => {
            const mockData = { chats: [], totalPages: 1 };
            fetch.mockResolvedValueOnce({
                json: async () => mockData,
            });

            const result = await fetchChats("user", "user123", null, "product", 1);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/chats/user/user123?role=user")
            );
            expect(result).toEqual(mockData);
        });

        it("should throw error on fetch failure", async () => {
            const error = new Error("Network error");
            fetch.mockRejectedValueOnce(error);

            await expect(fetchChats("user", "user123", null, "product", 1)).rejects.toThrow(error);
        });
    });

    describe("openChat", () => {
        it("should open a chat", async () => {
            const mockData = { _id: "chat123", messages: [] };
            fetch.mockResolvedValueOnce({
                json: async () => mockData,
            });

            const result = await openChat("chat123", "user123", 5);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/chats/chat123?page=1&limit=5")
            );
            expect(result).toEqual(mockData);
        });

        it("should throw error on failure", async () => {
            const error = new Error("Failed to open chat");
            fetch.mockRejectedValueOnce(error);

            await expect(openChat("chat123", "user123", 5)).rejects.toThrow(error);
        });
    });

    describe("sendMessage", () => {
        it("should send a message", async () => {
            const mockData = { _id: "msg123", text: "Hello" };
            fetch.mockResolvedValueOnce({
                json: async () => mockData,
            });

            const result = await sendMessage("chat123", "user123", "Hello");

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/chats/chat123/message"),
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ senderId: "user123", text: "Hello", isRead: false }),
                })
            );
            expect(result).toEqual(mockData);
        });

        it("should throw error on failure", async () => {
            const error = new Error("Failed to send");
            fetch.mockRejectedValueOnce(error);

            await expect(sendMessage("chat123", "user123", "Hello")).rejects.toThrow(error);
        });
    });

    describe("loadMoreMessages", () => {
        it("should load more messages", async () => {
            const mockData = { messages: [] };
            fetch.mockResolvedValueOnce({
                json: async () => mockData,
            });

            const result = await loadMoreMessages("chat123", 1, 5);

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/chats/chat123?page=2&limit=5")
            );
            expect(result).toEqual(mockData);
        });
    });

    describe("startNewChat", () => {
        it("should start a new chat", async () => {
            const mockData = { _id: "newChat123" };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });

            const result = await startNewChat("user", "user123", "seller123", "product", "12345");

            expect(fetch).toHaveBeenCalledWith(
                "http://localhost:5000/api/chats/create",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({
                        type: "product",
                        number: "12345",
                        sellerId: "seller123",
                        userId: "user123",
                    }),
                })
            );
            expect(result).toEqual(mockData);
        });

        it("should throw error if chat type is missing", async () => {
            await expect(startNewChat("user", "user123", "seller123", "", "12345")).rejects.toThrow(
                "Please enter chat type!"
            );
        });

        it("should throw error if number is missing", async () => {
            await expect(startNewChat("user", "user123", "seller123", "product", "")).rejects.toThrow(
                "Please enter number!"
            );
        });

        it("should throw error if api returns not ok", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
            });

            await expect(
                startNewChat("user", "user123", "seller123", "product", "12345")
            ).rejects.toThrow("Error creating chat");
        });
    });

    describe("markMessagesAsRead", () => {
        it("should mark messages as read", async () => {
            const mockData = { _id: "chat123", messages: [] };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });

            const result = await markMessagesAsRead("chat123");

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/chats/chat123/messages/read"),
                expect.objectContaining({
                    method: "PATCH",
                })
            );
            expect(result).toEqual(mockData);
        });

        it("should throw error if api returns not ok", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
            });

            await expect(markMessagesAsRead("chat123")).rejects.toThrow(
                "Error marking messages as read"
            );
        });
    });
});
