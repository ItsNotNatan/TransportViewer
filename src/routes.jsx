import { createBrowserRouter } from 'react-router-dom';

import Login from './pages/login/login';
import Home from './pages/home/home';

// Configuração das rotas
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  }
]);