// src/pages/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardExpandido from '../../componentes/CardExpandido/CardExpandido';
import DashboardComponent from '../../componentes/Dashboard/Dashboard';

// Ícone simples de logout
const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

export default function AdminDashboard() {
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [atms, setAtms] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem('token');

      const resposta = await fetch('http://localhost:3001/api/admin/transportes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (resposta.status === 401 || resposta.status === 403) {
        handleLogout(); // Se o token falhar, desloga na hora
        return;
      }

      const dados = await resposta.json();
      if (resposta.ok) {
        setAtms(dados);
      }
    } catch (erro) {
      console.error("Erro na comunicação com a API:", erro);
    } finally {
      setCarregando(false);
    }
  };

  // 👇 FUNÇÃO DE LOGOUT 👇
  const handleLogout = () => {
    localStorage.clear(); // Remove Token, Nome e Perfil
    navigate('/login');   // Manda pro Login
  };

  return (
    <div style={{ padding: '1rem' }}>
      
      {/* CABEÇALHO DE TESTE COM BOTÃO DE SAIR */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.2rem', backgroundColor: '#fee2e2', color: '#ef4444',
            border: '1px solid #fecaca', borderRadius: '0.5rem', fontWeight: 'bold',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#fee2e2'}
        >
          <LogOutIcon /> Sair do Sistema
        </button>
      </div>

      {/* 1. COMPONENTE DA TABELA E FILTROS */}
      <DashboardComponent 
        atms={atms} 
        carregando={carregando} 
        onOpenAtm={(atm) => setSelectedAtm(atm)} 
      />

      {/* 2. COMPONENTE MODAL (CARDS EXPANDIDOS E EDIÇÃO) */}
      <CardExpandido 
        atm={selectedAtm} 
        onClose={() => setSelectedAtm(null)}
        onAtmUpdated={() => {
          setSelectedAtm(null); 
          buscarPedidos(); 
        }} 
      />
    </div>
  );
}