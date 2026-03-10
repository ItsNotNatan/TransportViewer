// CardEditavel.jsx
import React, { useState } from 'react';

const SaveIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

export default function CardEditavel({ atm, onCancelar, onSalvar }) {
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    
    const formData = new FormData(e.target);
    const dadosAtualizados = Object.fromEntries(formData.entries());

    try {
      const resposta = await fetch(`http://localhost:3001/api/admin/transportes/${atm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: dadosAtualizados.status,
          cotacao_bid: dadosAtualizados.valor_frete,
          nf: dadosAtualizados.nf,
          pedido_compra: dadosAtualizados.pedido_compra,
          observacoes: dadosAtualizados.observacoes
        }),
      });

      if (resposta.ok) {
        onSalvar(); // Avisa o Pai que deu tudo certo
      } else {
        alert('Erro ao atualizar o pedido no servidor.');
      }
    } catch (erro) {
      alert('Erro de conexão ao tentar salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body" style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', color: '#374151' }}>Status do Transporte</label>
            <select name="status" defaultValue={atm.status} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }}>
              <option value="Aguardando Aprovação">Aguardando Aprovação</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Em Trânsito">Em Trânsito</option>
              <option value="Entregue">Entregue</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', color: '#374151' }}>Valor do Frete (R$)</label>
            <input type="number" step="0.01" name="valor_frete" defaultValue={atm.cotacao_bid || atm.valor_frete || ''} placeholder="Ex: 1500.00" style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', color: '#374151' }}>Pedido de Compra</label>
            <input type="text" name="pedido_compra" defaultValue={atm.pedido_compra || ''} placeholder="Atualizar Pedido..." style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', color: '#374151' }}>Nota Fiscal</label>
            <input type="text" name="nf" defaultValue={atm.nf || ''} placeholder="Atualizar NF..." style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
            <label style={{ fontWeight: 'bold', color: '#374151' }}>Observações / Anotações</label>
            <textarea name="observacoes" defaultValue={atm.observacoes || ''} rows="3" placeholder="Anotações internas..." style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none', resize: 'vertical' }}></textarea>
          </div>

        </div>
      </div>

      <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f9fafb' }}>
        <button type="button" onClick={onCancelar} style={{ padding: '0.625rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', cursor: 'pointer', backgroundColor: 'transparent', fontWeight: 'bold', color: '#374151' }}>
          Cancelar
        </button>
        <button type="submit" disabled={salvando} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2563eb', color: 'white', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          {salvando ? 'A Salvar...' : <><SaveIcon size={18} /> Salvar Alterações</>}
        </button>
      </div>
    </form>
  );
}