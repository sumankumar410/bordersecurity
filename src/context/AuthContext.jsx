import React, { createContext, useContext, useState, useCallback } from "react";
import { authenticateUser } from "@/data/villages";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [village, setVillage] = useState(() => {
        const stored = sessionStorage.getItem("rn_village");
        return stored ? JSON.parse(stored) : null;
    });
    const login = useCallback((username, password) => {
        const found = authenticateUser(username, password);
        if (found) {
            setVillage(found);
            sessionStorage.setItem("rn_village", JSON.stringify(found));
            return null;
        }
        return "Invalid credentials. Access denied.";
    }, []);
    const logout = useCallback(() => {
        setVillage(null);
        sessionStorage.removeItem("rn_village");
    }, []);
    return (<AuthContext.Provider value={{ isAuthenticated: !!village, village, login, logout }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
