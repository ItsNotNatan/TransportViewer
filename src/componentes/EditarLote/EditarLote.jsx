// src/componentes/EditarLote/EditarLote.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './EditarLote.css';

// Ícones (Mesmos do seu padrão)
const XCircle = ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const X = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const AlertTriangle = ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

export default function EditarLote({ aberto, onClose, idsSelecionados, onSalvar }) {
  // Estado para armazenar apenas o que o usuário quer alterar
  const estadoInicial = {
    wbs: '', solicitante: '', pedido: '', nf: '', transportadora: '',
    valor_previsto: '', rota_origem: '', rota_destino: '', tipo_frete: '', veiculo: '',
    status: '', tipo_documento: '', data_map: '', fatura: '', valor_fatura: '',
    data_emissao: '', vencimento: '', elemento_pep: '', validacao_pep: '', sap: ''
  };

  const [valores, setValores] = useState(estadoInicial);

  if (!aberto) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValores(prev => ({ ...prev, [name]: value }));
  };

  const handleLimpar = () => {
    setValores(estadoInicial);
  };

  const handleSalvar = () => {
    // Pega apenas as chaves que não estão vazias para enviar ao backend
    const dadosParaAtualizar = Object.fromEntries(
      Object.entries(valores).filter(([_, v]) => v.trim() !== '')
    );
    
    // Envia os IDs selecionados + os dados alterados para o componente pai
    onSalvar(idsSelecionados, dadosParaAtualizar);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content modal-larga fade-in">
        
        <div className="modal-header">
          <div>
            <span className="modal-subtitle">Alteração Múltipla</span>
            <h2 className="modal-title">Editar {idsSelecionados?.length || 0} Itens em Lote</h2>
          </div>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Alerta de UX importante para o usuário */}
          <div className="alerta-edicao-lote">
            <AlertTriangle size={20} />
            <p><strong>Atenção:</strong> Apenas os campos que você preencher abaixo serão alterados. <strong>Os campos em branco manterão os valores originais</strong> de cada item.</p>
          </div>

          {/* Grid de 3 colunas para caber os 20 campos */}
          <div className="filtros-grid grid-3-colunas">
            
            <div className="filtro-card"><label className="filtro-label">WBS</label>
              <input type="text" name="wbs" value={valores.wbs} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Solicitante</label>
              <input type="text" name="solicitante" value={valores.solicitante} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Pedido</label>
              <input type="text" name="pedido" value={valores.pedido} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">NF</label>
              <input type="text" name="nf" value={valores.nf} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Transportadora</label>
              <input type="text" name="transportadora" value={valores.transportadora} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Vlr. Previsto</label>
              <input type="number" name="valor_previsto" value={valores.valor_previsto} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            
            {/* Rota dividida em dois campos para facilitar */}
            <div className="filtro-card"><label className="filtro-label">Rota (De: Origem)</label>
              <input type="text" name="rota_origem" value={valores.rota_origem} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Rota (Para: Destino)</label>
              <input type="text" name="rota_destino" value={valores.rota_destino} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>

            <div className="filtro-card"><label className="filtro-label">T. Frete</label>
              <input type="text" name="tipo_frete" value={valores.tipo_frete} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Veículo</label>
              <input type="text" name="veiculo" value={valores.veiculo} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>

            <div className="filtro-card"><label className="filtro-label">Status</label>
              <select name="status" value={valores.status} onChange={handleChange} className="input-padrao dropdown-padrao">
                <option value="">-- Deixar original --</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Rota">Em Rota</option>
                <option value="Entregue">Entregue</option>
                <option value="Recusado">Recusado</option>
                <option value="Frete Morto">Frete Morto</option>
              </select>
            </div>

            <div className="filtro-card"><label className="filtro-label">Tipo Doc.</label>
              <input type="text" name="tipo_documento" value={valores.tipo_documento} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Data Map.</label>
              <input type="date" name="data_map" value={valores.data_map} onChange={handleChange} className="input-padrao" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Fatura</label>
              <input type="text" name="fatura" value={valores.fatura} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Valor (R$)</label>
              <input type="number" name="valor_fatura" value={valores.valor_fatura} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Data Emissão</label>
              <input type="date" name="data_emissao" value={valores.data_emissao} onChange={handleChange} className="input-padrao" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Vencimento</label>
              <input type="date" name="vencimento" value={valores.vencimento} onChange={handleChange} className="input-padrao" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Elem. PEP</label>
              <input type="text" name="elemento_pep" value={valores.elemento_pep} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">Valid. PEP</label>
              <input type="text" name="validacao_pep" value={valores.validacao_pep} onChange={handleChange} className="input-padrao" placeholder="Deixar original" />
            </div>
            <div className="filtro-card"><label className="filtro-label">SAP</label>
              <select name="sap" value={valores.sap} onChange={handleChange} className="input-padrao dropdown-padrao">
                <option value="">-- Deixar original --</option>
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={handleLimpar} className="btn-limpar">
            <XCircle size={18} /> Limpar Edições
          </button>
          
          <button type="button" onClick={handleSalvar} className="btn-submit btn-salvar-lote">
            Aplicar em {idsSelecionados?.length || 0} Itens
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}