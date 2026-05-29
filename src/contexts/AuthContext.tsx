import { createContext, useContext, useState, type ReactNode } from "react";

type TipoPerfil = 'ALUNO' | 'INSTRUTOR' | null;

type AuthContextValue = {
    isAuthenticated: boolean;
    tipoPerfil: TipoPerfil;
    storeToken: (token: string, perfil: TipoPerfil) => void;
    clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodificarPerfil(token: string): TipoPerfil {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.tipoPerfil ?? null;
    } catch {
        return null;
    }
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
    const tokenSalvo = localStorage.getItem("idrive_token") || "";
    const [token, setToken] = useState(tokenSalvo);
    const [tipoPerfil, setTipoPerfil] = useState<TipoPerfil>(
        tokenSalvo ? decodificarPerfil(tokenSalvo) : null
    );

    function storeToken(novoToken: string, perfil: TipoPerfil) {
        localStorage.setItem("idrive_token", novoToken);
        setToken(novoToken);
        setTipoPerfil(perfil);
    }

    function clearToken() {
        localStorage.removeItem("idrive_token");
        setToken("");
        setTipoPerfil(null);
    }

    const contextValue: AuthContextValue = {
        isAuthenticated: !!token,
        tipoPerfil,
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
