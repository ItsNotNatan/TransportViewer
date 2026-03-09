import { createBrowserRouter } from 'react-router-dom';

import Login from './pages/login/login';
// A importação do Home antigo foi eliminada daqui!
import AdminProfile from './pages/AdminProfile/AdminProfile';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Layout from './componentes/layout/layout';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // O Layout agora manda na página inicial
    children: [
      {
        path: "", // O caminho vazio "" agora representa a rota raiz "/"
        element: <AdminDashboard /> // O Dashboard é a sua nova Home!
      },
      {
        path: "perfil", // Representa a rota "/perfil"
        element: <AdminProfile /> 
      }
    ]
  },
  {
    path: "/login",
    element: <Login />, // Já deixei a rota de login pronta aqui para o futuro
  }
]);