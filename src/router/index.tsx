import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import PrivateRoute from "./PrivateRoute";

const Login = lazy(() => import("../features/auth/Login"));
const Cadastro = lazy(() => import("../features/auth/Cadastro"));
const Dashboard = lazy(() => import("../features/dashboard/Dashboard"));
const GerenciarAulas = lazy(() => import("../features/aulas/GerenciarAulas"));
const Anuncios = lazy(() => import("../features/anuncios/Anuncios"));
const Perfil = lazy(() => import("../features/perfil/Perfil"));
const MinhasAulas = lazy(() => import("../features/minhasAulas/MinhasAulas"));

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
        errorElement: <h1>404 - Página não encontrada</h1>,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/cadastro",
        element: <Cadastro />,
    },
    {
        path: "/dashboard",
        element: <Dashboard />,
    },
    {
        path: "/aulas",
        element: <GerenciarAulas />,
    },
    {
        path: "/anuncios",
        element: <Anuncios />,
    },
    {
        path: "/perfil",
        element: <Perfil />,
    },
    {
        path: "/minhas-aulas",
        element: <MinhasAulas/>,
    },
]);


  // {
  //      path: "/anuncios",
  //      element: <PrivateRoute><Anuncios /></PrivateRoute>,
  //  }
