import { useState, useEffect, useMemo, useCallback } from "react";

/**
 * Hook to manage the UI state of the chat, including responsiveness
 * and visibility of sidebar vs chat window on mobile.
 */
export const useChatUI = () => {
    // Flag for mobile view (screen width <= 768px)
    const [isMobile, setIsMobile] = useState(false);

    // Controls visibility of the sidebar (chat list)
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);

    // Controls whether the chat window part is "active" or should be shown
    const [isChatWindowActive, setIsChatWindowActive] = useState(false);

    // Controls specific hidden state of the chat window
    const [isChatWindowHidden, setIsChatWindowHidden] = useState(false);

    // Monitor window resize to update mobile flag
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    /**
     * Action to transition from chat window back to sidebar on mobile.
     */
    const handleBackToSidebar = useCallback(() => {
        setIsSidebarHidden(false);
        setIsChatWindowHidden(true);
        setIsChatWindowActive(false);
    }, []);

    /**
     * Logic to switch views when a chat is opened.
     */
    const handleUIOnChatOpen = useCallback(() => {
        if (isMobile) {
            setIsSidebarHidden(true);
            setIsChatWindowHidden(false);
        } else {
            setIsSidebarHidden(false);
            setIsChatWindowHidden(false);
        }
        setIsChatWindowActive(true);
    }, [isMobile]);

    return useMemo(() => ({
        isMobile,
        isSidebarHidden,
        setIsSidebarHidden,
        isChatWindowActive,
        setIsChatWindowActive,
        isChatWindowHidden,
        setIsChatWindowHidden,
        handleBackToSidebar,
        handleUIOnChatOpen,
    }), [isMobile, isSidebarHidden, isChatWindowActive, isChatWindowHidden]);
};
