import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Login from './pages/login/login';
import AdminProfile from './pages/AdminProfile/AdminProfile';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Layout from './componentes/layout/layout';

// ======================================================
// COMPONENTE DE PROTEÇÃO (O "Segurança da Porta")
// ======================================================
const RotaPrivada = ({ children }) => {
  // Verifica se existe alguém logado (se salvamos o nome no login)
  const usuarioLogado = localStorage.getItem('userName');
  
  if (!usuarioLogado) {
    // Se NÃO estiver logado, redireciona para a tela de login imediatamente
    return <Navigate to="/login" replace />;
  }
  
  // Se ESTIVER logado, deixa a pessoa entrar na tela que ela pediu
  return children;
};

// ======================================================
// CONFIGURAÇÃO DAS ROTAS
// ======================================================
export const router = createBrowserRouter([
  {
    path: "/",
    // Envolvemos o Layout (que tem o Menu e o Header) com a Rota Privada!
    // Assim, todas as rotas filhas ficam protegidas automaticamente.
    element: (
      <RotaPrivada>
        <Layout />
      </RotaPrivada>
    ), 
    children: [
      {
        path: "", 
        element: <AdminDashboard /> 
      },
      {
        path: "perfil", 
        element: <AdminProfile /> 
      }
    ]
  },
  {
    path: "/login",
    element: <Login />, 
  }
]);

