// CardExpandido.jsx
import React, { useState } from 'react';
import BtnPdf from '../BtnPdf/BtnPdf'; 
import CardEditavel from '../CardEditavel/CardEditavel';

const X = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const EditIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

export default function CardExpandido({ atm, onClose, onAtmUpdated }) {
  const [modoEdicao, setModoEdicao] = useState(false);

  if (!atm) return null;

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';
  
  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };
  
  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
  };
  
  const formatarValor = (valor) => {
    if (!valor || isNaN(valor)) return 'Sob Consulta';
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const lidarComSalvar = () => {
    setModoEdicao(false); // Sai do modo edição
    if (onAtmUpdated) onAtmUpdated(); // Atualiza a tabela
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in" style={{ maxWidth: '900px' }}>
        
        {/* CABEÇALHO DO MODAL (Fixo) */}
        <div className="modal-header">
          <div>
            <span className="modal-subtitle">{modoEdicao ? 'Editando Informações' : 'Ficha Cadastral Logística'}</span>
            <h2 className="modal-title">ATM #{shortId(atm.id)}</h2>
          </div>
          <button className="btn-close" onClick={onClose}><X size={24} /></button>
        </div>

        {/* DECISÃO DE RENDERIZAÇÃO: MODO LEITURA OU MODO EDIÇÃO */}
        {modoEdicao ? (
          
          <CardEditavel 
            atm={atm} 
            onCancelar={() => setModoEdicao(false)} 
            onSalvar={lidarComSalvar} 
          />

        ) : (
          
          <>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Identificação Básica</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Solicitante:</span> <strong style={{color: '#111827'}}>{atm.solicitacao || 'Não informado'}</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Data Solicitação:</span> <strong style={{color: '#111827'}}>{formatarData(atm.data_solicitacao || atm.created_at?.split('T')[0])}</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Pedido de Compra:</span> <strong style={{color: '#111827'}}>{atm.pedido_compra || 'Não informado'}</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Nota Fiscal:</span> <strong style={{color: '#111827'}}>{atm.nf || 'Não informado'}</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>WBS / C. Custo:</span> <strong style={{color: '#111827'}}>{atm.wbs || 'Não informado'}</strong></li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Carga e Transporte</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Peso Estimado:</span> <strong style={{color: '#111827'}}>{atm.peso ? `${atm.peso} kg` : 'Não informado'}</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Volume:</span> <strong style={{color: '#111827'}}>{atm.volume ? `${atm.volume} m³` : 'Não informado'}</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Veículo / Modal:</span> <strong style={{color: '#111827'}}>{atm.veiculo || 'Não informado'}</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Tipo de Frete:</span> <strong style={{color: '#111827'}}>{atm.tipo_frete || 'Não informado'}</strong></li>
                    <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{color: '#6b7280'}}>Transportadora:</span> <strong style={{color: '#111827'}}>{atm.transportadora?.nome || 'A Definir'}</strong></li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Rota (Origem e Destino)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>De: (Coleta)</span>
                      <strong style={{ display: 'block', color: '#111827', marginTop: '0.25rem', fontSize: '1rem' }}>{atm.origem?.nome_local || 'Não informado'}</strong>
                      <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{atm.origem?.municipio} - {atm.origem?.uf}</span>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Para: (Entrega)</span>
                      <strong style={{ display: 'block', color: '#111827', marginTop: '0.25rem', fontSize: '1rem' }}>{atm.destino?.nome_local || 'Não informado'}</strong>
                      <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{atm.destino?.municipio} - {atm.destino?.uf}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Acompanhamento e Financeiro</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Status Atual:</span> 
                    <span className={`badge ${getStatusClass(atm.status)}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>{atm.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#ecfdf5', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                    <span style={{ color: '#065f46', fontWeight: 'bold' }}>Valor do Frete:</span> 
                    <strong style={{ color: '#059669', fontSize: '1.2rem' }}>{formatarValor(atm.valor_nf || atm.cotacao_bid)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#92400e', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>Observações do Solicitante</span>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>{atm.observacoes || 'Nenhuma observação extra registrada.'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <BtnPdf atm={atm} />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setModoEdicao(true)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <EditIcon size={18} /> Editar Pedido
                </button>
                <button className="btn-secondary" onClick={onClose}>Fechar</button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}