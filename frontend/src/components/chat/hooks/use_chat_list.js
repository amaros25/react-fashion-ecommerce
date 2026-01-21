import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { fetchChats } from "../chat_api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

/**
 * Hook to manage fetching and paginating the chat sidebar list.
 * Also handles the "lazy" temporary chat creation for initial navigation.
 */
export const useChatList = (userId, partnerId, token, initialType, initialNumber, initialMessage, handleOpenChat, chats, setChats) => {
    const { t } = useTranslation();
    const [totalPages, setTotalPages] = useState(1);
    const [sidebarCurrentPage, setSidebarCurrentPage] = useState(1);
    const hasHandledInitial = useRef(false);

    // Use a ref for chats to keep loadChats stable and avoid stale closures without dependency loops
    const chatsRef = useRef(chats);
    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    // Use refs for callbacks and static props to avoid them triggering the fetch effect
    const handleOpenChatRef = useRef(handleOpenChat);
    const setChatsRef = useRef(setChats);
    const initialNumberRef = useRef(initialNumber);
    const initialTypeRef = useRef(initialType);

    useEffect(() => {
        handleOpenChatRef.current = handleOpenChat;
        setChatsRef.current = setChats;
        initialNumberRef.current = initialNumber;
        initialTypeRef.current = initialType;
    }, [handleOpenChat, setChats, initialNumber, initialType]);

    const lastFetchedParams = useRef("");
    const isFetching = useRef(false);

    // Keep token and t in refs to avoid them triggering the effect if they change reference
    const tokenRef = useRef(token);
    const tRef = useRef(t);
    useEffect(() => {
        tokenRef.current = token;
        tRef.current = t;
    }, [token, t]);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const currentParams = JSON.stringify({ userId, partnerId, sidebarCurrentPage, initialType, role });
        if (lastFetchedParams.current === currentParams) return;

        // Synchronously update the ref to prevent double-calls from synchronous React renders (like Strict Mode)
        lastFetchedParams.current = currentParams;

        const controller = new AbortController();

        const loadChats = async () => {
            if (!userId) return;

            isFetching.current = true;
            const role = localStorage.getItem("role");
            const sellerIdFromStorage = role === "seller" ? userId : partnerId;

            const result = await fetchChats(
                role,
                userId,
                sellerIdFromStorage,
                initialType,
                sidebarCurrentPage,
                tokenRef.current,
                controller.signal
            );

            if (controller.signal.aborted) {
                isFetching.current = false;
                return;
            }

            if (result.success) {
                let currentChats = result.data.chats;
                setTotalPages(result.data.totalPages);

                // Handle initial chat priority ONLY ONCE and only on PAGE 1
                const currentInitialNumber = initialNumberRef.current;
                const currentInitialType = initialTypeRef.current;

                if (!hasHandledInitial.current && sidebarCurrentPage === 1 && currentInitialNumber?.trim()) {
                    hasHandledInitial.current = true;

                    const existingChat = currentChats.find(c =>
                        c.subjectNumber === currentInitialNumber &&
                        c.type === currentInitialType &&
                        (c.participant1Id == partnerId || c.participant2Id == partnerId)
                    );

                    if (existingChat) {
                        handleOpenChatRef.current(existingChat.id);
                    } else {
                        const tempId = "temp_" + Date.now();
                        const alreadyExistsTemp = chatsRef.current.find(c =>
                            c.subjectNumber === currentInitialNumber &&
                            c.type === currentInitialType &&
                            c.id.toString().startsWith("temp_") &&
                            (c.participant1Id == partnerId || c.participant2Id == partnerId)
                        );

                        if (!alreadyExistsTemp) {
                            const chatEntry = {
                                id: tempId,
                                type: currentInitialType,
                                subjectNumber: currentInitialNumber,
                                updatedAt: new Date().toISOString(),
                                messages: [],
                                participant1Id: role === "seller" ? partnerId : userId,
                                participant2Id: role === "seller" ? userId : partnerId
                            };
                            currentChats = [chatEntry, ...currentChats];
                            handleOpenChatRef.current(tempId);
                        }
                    }
                }
                setChatsRef.current(currentChats.map(c => ({
                    ...c,
                    // Ensure ID is string for "temp_" checks
                    id: c.id?.toString() || c._id?.toString(),
                    // Flatten otherParticipant info for sidebar
                    otherParticipant: c.otherParticipant ||
                        (c.participant1Id == userId ? c.participant2 : c.participant1)
                })));
            } else if (!result.aborted) {
                toast.error(tRef.current(result.errorKey));
            }
            isFetching.current = false;
        };

        const timeoutId = setTimeout(() => {
            loadChats();
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
            isFetching.current = false;
        };
    }, [userId, partnerId, sidebarCurrentPage, initialType]);

    const handlePageChange = useCallback((pageNumber) => {
        setSidebarCurrentPage(pageNumber);
    }, []);

    return useMemo(() => ({
        chats,
        setChats,
        totalPages,
        sidebarCurrentPage,
        setSidebarCurrentPage,
        handlePageChange
    }), [chats, totalPages, sidebarCurrentPage, handlePageChange]);
};
