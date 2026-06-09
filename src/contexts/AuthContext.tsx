import { createContext, useContext, useState, type ReactNode } from "react";

type TipoPerfil = 'ALUNO' | 'INSTRUTOR' | null;

type AuthContextValue = {
    isAuthenticated: boolean;
    tipoPerfil: TipoPerfil;
    storeToken: (token: string, perfil: TipoPerfil) => void;
    clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function validarEDecodificarPerfil(token: string): TipoPerfil {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null; // Token expirado
        }

        return payload.tipoPerfil ?? null;
    } catch {
        return null; // Token inválido
    }
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
    const tokenSalvo = localStorage.getItem("idrive_token") || "";
    const perfilValido = tokenSalvo ? validarEDecodificarPerfil(tokenSalvo) : null;

    if (tokenSalvo && !perfilValido) {
        localStorage.removeItem("idrive_token");
    }

    const [token, setToken] = useState(perfilValido ? tokenSalvo : "");
    const [tipoPerfil, setTipoPerfil] = useState<TipoPerfil>(perfilValido);

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