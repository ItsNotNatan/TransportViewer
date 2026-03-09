import React from 'react';

const UserGear = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19.5 13.5v.5c0 .28.22.5.5.5h.5a.5.5 0 0 0 .5-.5v-.5a.5.5 0 0 0-.5-.5h-.5a.5.5 0 0 0-.5.5Z"/><path d="m20.5 13-1-1"/><path d="m19 14.5-1 1"/><path d="M20.5 16l-1-1"/><path d="m19 12.5-1 1"/></svg>;

export default function AdminProfile() {
  return (
    <section className="fade-in form-card-container">
      <div className="form-card max-w-2xl text-center">
        <div className="profile-icon"><UserGear size={40} /></div>
        <h3 className="profile-title">Perfil do Usuário</h3>
        <form className="mt-6 text-left" onSubmit={(e) => { e.preventDefault(); alert("Perfil atualizado!"); }}>
          <div className="input-group mb-4">
            <label>Nome Completo</label>
            <input type="text" className="input-field" defaultValue="Gestor Logística" />
          </div>
          <button type="submit" className="btn-dark w-full">Salvar Alterações</button>
        </form>
      </div>
    </section>
  );
}