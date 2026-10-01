import React, { createContext, useContext, useState, useCallback } from "react";
const CommContext = createContext(null);
export const CommProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
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
    return (<CommContext.Provider value={{ messages, sendMessage, getConversation, getAlertsForVillage }}>
      {children}
    </CommContext.Provider>);
};
export const useComm = () => {
    const ctx = useContext(CommContext);
    if (!ctx)
        throw new Error("useComm must be used within CommProvider");
    return ctx;
};
