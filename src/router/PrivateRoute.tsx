import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }: { children: ReactNode }) {
    const token = localStorage.getItem("idrive_token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}