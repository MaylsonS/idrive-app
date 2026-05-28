import { createContext, useContext, useState, type ReactNode } from "react";

type AuthContextValue = {
    isAuthenticated: boolean;
    storeToken: (token: string) => void;
    clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {

    const [token, setToken] = useState(localStorage.getItem("idrive_token") || "");

    function storeToken(token: string) {
        localStorage.setItem("idrive_token", token);
        setToken(token);
    }

    function clearToken() {
        localStorage.removeItem("idrive_token");
        setToken("");
    }

    const contextValue: AuthContextValue = {
        isAuthenticated: !!token,
        storeToken,
        clearToken,
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext(): AuthContextValue {
    return useContext(AuthContext)!;
}