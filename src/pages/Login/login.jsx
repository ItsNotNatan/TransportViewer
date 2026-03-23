// src/pages/login/login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

// --- Ícones SVG embutidos ---
const Truck = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-5V5H10"/><path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>;
const Mail = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const Lock = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

export default function Login() {
  const navigate = useNavigate(); 
  
  // Estados para capturar os dados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [erroValidacao, setErroValidacao] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErroValidacao('');

    try {
      // Faz o pedido POST para o servidor
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      // Validação para evitar erro caso o backend devolva HTML em vez de JSON
      const isJson = response.headers.get('content-type')?.includes('application/json');
      if (!isJson) {
        setErroValidacao('Erro no servidor. Verifique se o backend está a rodar.');
        setIsLoading(false);
        return;
      }

      // Extrai os dados que o Backend enviou (Incluindo o Token)
      const data = await response.json();

      if (response.ok) {
        // 👇 A MÁGICA DA SEGURANÇA ACONTECE AQUI 👇
        // Guarda a pulseira VIP (Token) e os dados do usuário no navegador
        localStorage.setItem('token', data.token); // <--- CRUCIAL PARA AS ROTAS PRIVADAS
        localStorage.setItem('userName', data.nome);
        localStorage.setItem('userPerfil', data.perfil);
        // 👆 ====================================== 👆
        
        // Redireciona para o Dashboard Admin (que está na rota "/")
        navigate('/'); 
      } else {
        // Se a senha estiver errada, mostra a mensagem vinda do backend
        setErroValidacao(data.mensagem || 'E-mail ou palavra-passe incorretos.');
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setErroValidacao('Sem conexão com o servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper"><Truck size={32} /></div>
          <h2 className="login-title">ATM<span className="text-primary">Log</span></h2>
          <p className="login-subtitle">Acesso restrito a colaboradores</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-container">
            
            {/* CAMPO DE E-MAIL */}
            <div className="form-group">
              <label className="form-label">E-mail Corporativo</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  placeholder="admin@comau.com" 
                  className="form-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            {/* CAMPO DE SENHA */}
            <div className="form-group">
              <label className="form-label">Palavra-passe</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="form-input" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required 
                  minLength={6} 
                />
              </div>
            </div>

            {/* MENSAGEM DE ERRO */}
            {erroValidacao && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem', fontWeight: 'bold' }}>
                {erroValidacao}
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="btn-submit" style={{ marginTop: '1.5rem' }}>
            {isLoading ? <div className="spinner mx-auto"></div> : 'Entrar no Sistema'}
          </button>

          <div className="login-footer">
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Sistema Integrado de Gestão Logística</span>
          </div>
        </form>
      </div>
    </div>
  );
}