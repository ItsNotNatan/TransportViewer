// src/routes.jsx
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import Login from './pages/login/login';
import AdminProfile from './pages/AdminProfile/AdminProfile';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Layout from './componentes/layout/layout';

// ======================================================
// COMPONENTE DE PROTEÇÃO MELHORADO (O "Segurança Blindado")
// ======================================================
const RotaPrivada = ({ children }) => {
  // 🔴 ANTES: const usuarioLogado = localStorage.getItem('userName');
  // 🟢 AGORA: Verificamos o Token de segurança
  const token = localStorage.getItem('token'); 
  
  if (!token) {
    // Se não tem token, chuta pro login
    return <Navigate to="/login" replace />;
  }
  
  // Se tem token, deixa entrar!
  return children;
};

// ======================================================
// CONFIGURAÇÃO DAS ROTAS (Fica igual!)
// ======================================================
export const router = createBrowserRouter([
  {
    path: "/",
    // O Layout continua protegido pela RotaPrivada
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