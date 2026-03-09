import { createBrowserRouter } from 'react-router-dom';

import Login from './pages/login/login';
import Home from './pages/home/home';
import AdminProfile from './pages/AdminProfile/AdminProfile';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Layout from './componentes/layout/layout'; // Importado da sua pasta exata!

// Configuração das rotas
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/admin",
    element: <Layout />, // O Layout entra aqui como Mestre
    children: [
      {
        path: "", // Representa o /admin (Tabela)
        element: <AdminDashboard /> 
      },
      {
        path: "perfil", // Representa o /admin/perfil (Perfil)
        element: <AdminProfile /> 
      }
    ]
  }
]);