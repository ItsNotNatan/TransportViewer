import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importação necessária para o Router
import './login.css';

// --- Ícones SVG embutidos ---
const Truck = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-5V5H10"/><path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>;
const User = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Mail = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const Lock = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const LogIn = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>;

export default function Login() {
  const navigate = useNavigate(); // Hook para mudar de página
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de login
    setTimeout(() => {
      setIsLoading(false);
      navigate('/home'); // REDIRECIONA PARA A HOME APÓS O LOGIN
    }, 1000);
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper"><Truck size={32} /></div>
          <h2 className="login-title">ATM<span className="text-primary">Log</span></h2>
          <p className="login-subtitle">{isLoginMode ? 'Aceda à sua conta' : 'Crie o seu acesso'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-container">
            {!isLoginMode && (
              <div className="form-group fade-in">
                <label className="form-label">Nome Completo</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" placeholder="Seu nome" className="form-input" required />
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">E-mail Corporativo</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" placeholder="seu@email.com" className="form-input" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Palavra-passe</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="password" placeholder="••••••••" className="form-input" required minLength={6} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? <div className="spinner mx-auto"></div> : (isLoginMode ? 'Entrar no Sistema' : 'Criar Conta')}
          </button>

          <div className="login-footer">
            <span className="text-muted">{isLoginMode ? 'Ainda não tem acesso?' : 'Já possui conta?'}</span>
            <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="btn-toggle">
              {isLoginMode ? 'Criar conta grátis' : 'Fazer Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}