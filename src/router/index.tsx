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
const AvaliarAula  = lazy(() => import("../features/avaliacao/AvaliarAula"));
const Chat = lazy(() => import("../features/chat/Chat"));
const PerfilPublico = lazy(() => import("../features/perfil/PerfilPublico"));
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
        element: <PrivateRoute><Dashboard /></PrivateRoute>,
    },
    {
        path: "/aulas",
        element: <PrivateRoute><GerenciarAulas /></PrivateRoute>,
    },
    {
        path: "/anuncios",
        element: <PrivateRoute><Anuncios /></PrivateRoute>,
    },
    {
        path: "/perfil",
        element: <PrivateRoute><Perfil /></PrivateRoute>,
    },
    {
        path: "/perfil/:id",
        element: <PrivateRoute><PerfilPublico /></PrivateRoute>,
    },
    {
        path: "/minhas-aulas",
        element: <PrivateRoute><MinhasAulas/></PrivateRoute>,
    },
    {
        path: "/chat/:roomId?",
        element: <PrivateRoute><Chat /></PrivateRoute>,
    },
    {
        path: "/avaliar",
        element: <PrivateRoute><AvaliarAula /></PrivateRoute>,
    },
    {
        path: "/avaliar/:aulaId",
        element: <PrivateRoute><AvaliarAula /></PrivateRoute>,
    },
]);