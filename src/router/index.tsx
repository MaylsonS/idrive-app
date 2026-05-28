import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";

const PrivateRoute = lazy(() => import("./PrivateRoute"));
const Login = lazy(() => import("../features/auth/Login"));
const Cadastro = lazy(() => import("../features/auth/Cadastro"));
const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const GerenciarAulas = lazy(() => import("../features/aulas/GerenciarAulas"));

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
        errorElement: <h1>404 - Página não encontrada</h1>,
    },
    {
        path: "/login",
        element: <Login />,
        index: true,
    },
    {
        path: "/cadastro",
        element: <Cadastro />,
    },
    {
        path: "/dashboard",
        element: <PrivateRoute> <Dashboard /> </PrivateRoute>,
    },
    {
        path: "/aulas",
        element: <PrivateRoute> <GerenciarAulas /> </PrivateRoute>,
    }
]);