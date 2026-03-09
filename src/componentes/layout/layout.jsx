import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
// Ajuste o caminho do CSS se necessário, dependendo de onde ele está guardado
import './layout.css'; 

const Truck = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-5V5H10"/><path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>;
const ChartLine = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
const UserGear = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19.5 13.5v.5c0 .28.22.5.5.5h.5a.5.5 0 0 0 .5-.5v-.5a.5.5 0 0 0-.5-.5h-.5a.5.5 0 0 0-.5.5Z"/><path d="m20.5 13-1-1"/><path d="m19 14.5-1 1"/><path d="M20.5 16l-1-1"/><path d="m19 12.5-1 1"/></svg>;
const UserCircle = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>;
const LogOut = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

// NOTA: Em React, componentes devem começar com letra Maiúscula. 
// Exportamos como "Layout" para o React não reclamar.
export default function Layout() {
  return (
    <div className="home-layout">
      {/* MENU LATERAL FIXO */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Truck size={28} className="text-primary" />
          <h1 className="sidebar-title">ATM<span className="text-primary">Log</span></h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ChartLine size={20} /><span>Tabela Principal</span>
          </NavLink>
          
          <NavLink to="/admin/perfil" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserGear size={20} /><span>Meu Perfil</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">Sistema Ativo</div>
      </aside>

      {/* PARTE DIREITA DA TELA */}
      <main className="main-content">
        <header className="topbar">
          <h2 className="topbar-title">Painel de Gestão</h2>
          <div className="user-controls">
            <div className="user-info-wrapper">
              <div className="user-avatar"><UserCircle size={20} /></div>
              <div className="user-details">
                <span className="user-name">Admin Online</span>
                <span className="user-status"><span className="status-dot"></span> Online</span>
              </div>
            </div>
            <button className="btn-logout" title="Sair do sistema"><LogOut size={20} /></button>
          </div>
        </header>

        <div className="content-area">
          {/* O Dashboard e o Perfil vão aparecer aqui dentro */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}