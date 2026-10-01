import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
const CommContext = createContext(null);
export const CommProvider = ({ children }) => {
    const [messages, setMessages] = useState(() => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                const saved = window.localStorage.getItem("border_watch_comm_messages");
                if (saved) return JSON.parse(saved);
            }
        } catch {
            // fallback
        }
        return [];
    });
    useEffect(() => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                window.localStorage.setItem("border_watch_comm_messages", JSON.stringify(messages));
            }
        } catch {
            // fallback
        }
    }, [messages]);
    const sendMessage = useCallback((msg) => {
        const newMsg = {
            ...msg,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, newMsg]);
    }, []);
    const getConversation = useCallback((villageA, villageB) => {
        return messages.filter(m => (m.from === villageA && m.to === villageB) || (m.from === villageB && m.to === villageA)).sort((a, b) => a.timestamp - b.timestamp);
    }, [messages]);
    const getAlertsForVillage = useCallback((villageId) => {
        return messages.filter(m => m.type === "alert" && (m.to === villageId || m.to === "ALL")).sort((a, b) => b.timestamp - a.timestamp);
    }, [messages]);
    const getSentAlertsForVillage = useCallback((villageId) => {
        return messages.filter(m => m.type === "alert" && m.from === villageId).sort((a, b) => b.timestamp - a.timestamp);
    }, [messages]);
    return (<CommContext.Provider value={{ messages, sendMessage, getConversation, getAlertsForVillage, getSentAlertsForVillage }}>
      {children}
    </CommContext.Provider>);
};
export const useComm = () => {
    const ctx = useContext(CommContext);
    if (!ctx)
        throw new Error("useComm must be used within CommProvider");
    return ctx;
};
