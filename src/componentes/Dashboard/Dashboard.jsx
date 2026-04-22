// src/componentes/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import FiltroOP from '../FiltroOP/FiltroOP'; 
import FiltroFat from '../FiltroFat/FiltroFat';
import BtnExcel from '../BtnExcel/BtnExcel';
import EditarLote from '../EditarLote/EditarLote'; // 👈 1. Importação do novo Modal
import './Dashboard.css';

// Importando as nossas funções auxiliares do arquivo utils.js
import { 
  shortId, 
  formatarDataCurta, 
  formatarMoeda, 
  matchMultiSelect, 
  matchFiltro,
  matchData
} from '../../services/utils';

// --- Ícones ---
const TableList = ({ size = 24, className = "" }) => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const ChevronLeft = ({ size = 18 }) => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = ({ size = 18 }) => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const FilterIcon = ({ size = 16 }) => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const EditBatchIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

export default function Dashboard({ atms, carregando, onOpenAtm }) { // onOpenBatchEdit removido das props, não precisaremos mais
  const valoresIniciaisFiltro = { 
    id: '', solicitante: '', pedido: '', nf: '', data_inicio: '', data_fim: '', data_especifica: '', status: '', transportadora: '',
    fatura: '', elemento_pep: '', registrado_sap: '', tipo_documento: '', validacao_pep: '',
    data_map_inicio: '', data_map_fim: '', data_map_especifica: '',
    data_emissao_inicio: '', data_emissao_fim: '', data_emi_especifica: '',
    data_venc_inicio: '', data_venc_fim: '', data_venc_especifica: '' 
  };

  const [filtros, setFiltros] = useState(valoresIniciaisFiltro);
  const [abertoFiltroOp, setAbertoFiltroOp] = useState(false);
  const [abertoFiltroFat, setAbertoFiltroFat] = useState(false);
  const [abertoEdicaoLote, setAbertoEdicaoLote] = useState(false); // 👈 2. Novo estado do Modal
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [selecionados, setSelecionados] = useState([]);
  
  const itensPorPagina = 20;
  const tableContentRef = useRef(null);

  useEffect(() => { 
    setPaginaAtual(1); 
    setSelecionados([]); 
  }, [filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros(valoresIniciaisFiltro);
  };

  // 👈 3. Função que recebe os dados do Modal
  const handleSalvarLote = (ids, dadosAlterados) => {
    console.log("IDs que serão alterados:", ids);
    console.log("Novos dados:", dadosAlterados);
    
    // Aqui no futuro você colocará a lógica da sua API (fetch/axios) para atualizar no banco
    alert(`Sucesso! Abra o console do navegador (F12) para ver os ${ids.length} IDs e os dados que serão enviados ao banco.`);
    
    setAbertoEdicaoLote(false); // Fecha o modal
    setSelecionados([]); // Limpa as checkboxes
  };

  const atmsFiltrados = useMemo(() => {
    return atms.filter(atm => {
      return matchFiltro(atm.numero_atm || shortId(atm.id), filtros.id) &&
             matchFiltro(atm.pedido_compra, filtros.pedido) &&
             matchFiltro(atm.nf, filtros.nf) &&
             matchMultiSelect(atm.solicitacao, filtros.solicitante) &&
             matchMultiSelect(atm.status, filtros.status) &&
             matchMultiSelect(atm.transportadora?.nome, filtros.transportadora) &&
             matchData(atm.data_solicitacao, filtros.data_especifica, filtros.data_inicio, filtros.data_fim); 
    });
  }, [atms, filtros]);

  const totalPaginas = Math.ceil(atmsFiltrados.length / itensPorPagina);

  const atmsExibidos = useMemo(() => {
    return atmsFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
  }, [atmsFiltrados, paginaAtual]);

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'entregue') return 'badge-success';
    if (s === 'recusado' || s === 'frete morto') return 'badge-danger'; 
    if (s === 'em rota') return 'badge-info';
    return 'badge-warning';
  };

  const handleSelectRow = (id) => {
    setSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id] 
    );
  };

  const handleSelectAll = () => {
    const todosIdsPagina = atmsExibidos.map(atm => atm.id);
    const todosSelecionados = todosIdsPagina.length > 0 && todosIdsPagina.every(id => selecionados.includes(id));

    if (todosSelecionados) {
      setSelecionados(prev => prev.filter(id => !todosIdsPagina.includes(id)));
    } else {
      setSelecionados(prev => {
        const novosIds = todosIdsPagina.filter(id => !prev.includes(id));
        return [...prev, ...novosIds];
      });
    }
  };

  return (
    <section className="fade-in section-dashboard">

      <FiltroOP atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpar={limparFiltros} aberto={abertoFiltroOp} onClose={() => setAbertoFiltroOp(false)} />
      <FiltroFat atms={atms} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpar={limparFiltros} aberto={abertoFiltroFat} onClose={() => setAbertoFiltroFat(false)} />
      
      {/* 👈 4A. Adicionando o Componente do Modal na tela */}
      <EditarLote 
        aberto={abertoEdicaoLote} 
        onClose={() => setAbertoEdicaoLote(false)} 
        idsSelecionados={selecionados} 
        onSalvar={handleSalvarLote} 
      />

      {selecionados.length > 0 && (
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 20px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'slideDown 0.2s ease-out' }}>
          <span style={{ color: '#1e40af', fontSize: '0.95rem' }}>
            <strong>{selecionados.length}</strong> item(ns) selecionado(s)
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setSelecionados([])}
              style={{ backgroundColor: 'transparent', color: '#6b7280', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancelar
            </button>
            <button 
              onClick={() => setAbertoEdicaoLote(true)} /* 👈 4B. Atualizando o click do botão */
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <EditBatchIcon size={16} /> Editar em Lote
            </button>
          </div>
        </div>
      )}

      <div className="table-main-wrapper">
        <div className="table-scroll-container">
          <table className="dashboard-table" ref={tableContentRef}>
            <thead className="sticky-thead">
              <tr>
                <th colSpan="12" className="th-group-op">
                  <div className="th-group-content">
                    <span className="th-group-title">DADOS DA OPERAÇÃO</span>
                    <button className="btn-filter-header op" onClick={() => setAbertoFiltroOp(true)} aria-label="Abrir filtros de operação">
                      <FilterIcon size={14} /> Filtros
                    </button>
                  </div>
                </th>

                <th colSpan="9" className="th-group-fat">
                  <div className="th-group-content">
                    <span className="th-group-title">FATURAMENTO / SAP</span>
                    <button className="btn-filter-header fat" onClick={() => setAbertoFiltroFat(true)} aria-label="Abrir filtros de faturamento">
                      <FilterIcon size={14} /> Filtros
                    </button>
                  </div>
                </th>
              </tr>

              <tr className="tr-subheader">
                <th className="sticky-column-left" style={{ width: '40px', textAlign: 'center', zIndex: 30 }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={atmsExibidos.length > 0 && atmsExibidos.every(atm => selecionados.includes(atm.id))} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </th>
                <th className="sticky-column-left">ID ATM</th>
                <th>WBS</th>
                <th>Solicitante</th>
                <th>Pedido</th>
                <th>NF</th>
                <th className="col-highlight">Transportadora</th>
                <th className="col-highlight">Vlr. Previsto</th>
                <th>Rota</th>
                <th>T. Frete</th>
                <th>Veículo</th>
                <th className="td-border-right">Status</th>
                <th>Tipo Doc.</th>
                <th>Data Map.</th>
                <th>Fatura</th>
                <th>Valor (R$)</th>
                <th>Data Emissão</th>
                <th>Vencimento</th>
                <th>Elem. PEP</th>
                <th>Valid. PEP</th>
                <th>SAP</th>
              </tr>
            </thead>
            
            <tbody>
              {carregando ? (
                <tr><td colSpan="21" className="td-empty-state">Carregando dados mestre...</td></tr>
              ) : atmsExibidos.length === 0 ? (
                <tr><td colSpan="21" className="td-empty-state">Nenhum resultado encontrado.</td></tr>
              ) : atmsExibidos.map((atm) => {
                
                const isRecusado = atm.status?.toLowerCase() === 'recusado';
                const isSelected = selecionados.includes(atm.id);

                return (
                  <tr 
                    key={atm.id} 
                    className={`tr-data ${isRecusado ? 'linha-recusada' : ''} ${isSelected ? 'linha-selecionada' : ''}`} 
                    onDoubleClick={() => onOpenAtm(atm)} 
                    style={{ cursor: 'pointer', backgroundColor: isSelected ? '#f5f8ff' : '' }}
                    title="Duplo clique para abrir detalhes"
                  >
                    <td 
                      className="td-id" 
                      style={{ textAlign: 'center', backgroundColor: isSelected ? '#f5f8ff' : '' }} 
                      onClick={(e) => e.stopPropagation()}
                    >
                       <input 
                         type="checkbox" 
                         checked={isSelected} 
                         onChange={() => handleSelectRow(atm.id)} 
                         style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                       />
                    </td>
                    <td className="td-id" style={{ backgroundColor: isSelected ? '#f5f8ff' : '' }}>#{atm.numero_atm || shortId(atm.id)}</td>
                    <td>{atm.wbs || '-'}</td>
                    <td>{atm.solicitacao || '-'}</td>
                    <td>{atm.pedido_compra || '-'}</td>
                    <td>{atm.nf || '-'}</td>
                    
                    <td className="td-fw-600">{atm.transportadora?.nome || 'A DEFINIR'}</td>
                    <td className="td-fw-bold">
                      {formatarMoeda(atm.valor_frete || atm.valor || 0)}
                    </td>

                    <td className="td-route">
                      <span>De:</span> {atm.origem?.municipio}<br/>
                      <span>Para:</span> {atm.destino?.municipio}
                    </td>
                    <td><small>{atm.tipo_frete || '-'}</small></td>
                    <td>{atm.veiculo || '-'}</td>
                    <td className="td-border-right">
                      <span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span>
                    </td>
                    
                    <td>{atm.faturamento?.tipo_documento || '-'}</td>
                    <td><small>{formatarDataCurta(atm.faturamento?.data_mapeamento)}</small></td>
                    <td className="td-fatura">{atm.faturamento?.fatura_cte || '-'}</td>
                    <td className="td-valor">
                      {formatarMoeda(atm.faturamento?.valor || 0)}
                    </td>
                    <td>{formatarDataCurta(atm.faturamento?.data_emissao)}</td>
                    <td><strong className="td-vencimento">{formatarDataCurta(atm.faturamento?.vencimento)}</strong></td>
                    <td><small>{atm.faturamento?.elemento_pep_cc_wbs || '-'}</small></td>
                    <td>{atm.faturamento?.validacao_pep || '-'}</td>
                    <td className="td-center">{atm.faturamento?.registrado_sap || 'NÃO'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!carregando && atmsFiltrados.length > 0 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Mostrando <strong>{((paginaAtual - 1) * itensPorPagina) + 1}</strong> até <strong>{Math.min(paginaAtual * itensPorPagina, atmsFiltrados.length)}</strong> de <strong>{atmsFiltrados.length}</strong> registros
            </div>
            <BtnExcel atmsFiltrados={atmsFiltrados} />
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={() => setPaginaAtual(p => Math.max(p-1, 1))} disabled={paginaAtual === 1} aria-label="Página anterior"><ChevronLeft /> Anterior</button>
              <span className="pagination-page-text">{paginaAtual} / {totalPaginas}</span>
              <button className="pagination-btn" onClick={() => setPaginaAtual(p => Math.min(p+1, totalPaginas))} disabled={paginaAtual === totalPaginas} aria-label="Próxima página">Próxima <ChevronRight /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}