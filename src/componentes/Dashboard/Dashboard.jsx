import React, { useState, useEffect, useRef, useMemo } from 'react';
import FiltroOP from '../FiltroOP/FiltroOP'; 
import FiltroFat from '../FiltroFat/FiltroFat';
import BtnExcel from '../BtnExcel/BtnExcel';
import './Dashboard.css';

// Importando as nossas funções auxiliares do arquivo utils.js
import { 
  shortId, 
  formatarDataCurta, 
  formatarMoeda, 
  matchMultiSelect, 
  matchFiltro 
} from '../../services/utils'; 

// --- Ícones ---
const TableList = ({ size = 24, className = "" }) => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const ChevronLeft = ({ size = 18 }) => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = ({ size = 18 }) => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const FilterIcon = ({ size = 16 }) => <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
// 🟢 NOVO ÍCONE: Para o botão de edição em lote
const EditBatchIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

// 🟢 NOVO: Recebemos onOpenBatchEdit por props
export default function Dashboard({ atms, carregando, onOpenAtm, onOpenBatchEdit }) {
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
  const [paginaAtual, setPaginaAtual] = useState(1);
  
  // 🟢 NOVO: Estado para guardar os IDs das linhas selecionadas
  const [selecionados, setSelecionados] = useState([]);
  
  const itensPorPagina = 20;

  const tableContentRef = useRef(null);

  // Volta para a página 1 e limpa as seleções sempre que os filtros mudarem
  useEffect(() => { 
    setPaginaAtual(1); 
    setSelecionados([]); // 🟢 NOVO: Limpamos a seleção ao filtrar para evitar bugs
  }, [filtros]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltros(valoresIniciaisFiltro);
  };

  // 1º uso do useMemo: Memorizar a lista filtrada
  const atmsFiltrados = useMemo(() => {
    return atms.filter(atm => {
      return matchFiltro(atm.numero_atm || shortId(atm.id), filtros.id) &&
             matchFiltro(atm.pedido_compra, filtros.pedido) &&
             matchFiltro(atm.nf, filtros.nf) &&
             matchMultiSelect(atm.solicitacao, filtros.solicitante) &&
             matchMultiSelect(atm.status, filtros.status) &&
             matchMultiSelect(atm.transportadora?.nome, filtros.transportadora);
    });
  }, [atms, filtros]);

  const totalPaginas = Math.ceil(atmsFiltrados.length / itensPorPagina);

  // 2º uso do useMemo: Memorizar a fatia da página atual
  const atmsExibidos = useMemo(() => {
    return atmsFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
  }, [atmsFiltrados, paginaAtual]);

  // Função de cor do badge adaptada aos novos status
  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'entregue') return 'badge-success';
    if (s === 'recusado' || s === 'frete morto') return 'badge-danger'; 
    if (s === 'em rota') return 'badge-info';
    return 'badge-warning';
  };

  // 🟢 NOVO: Função para selecionar/deselecionar uma linha específica
  const handleSelectRow = (id) => {
    setSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) // Remove se já existe
        : [...prev, id] // Adiciona se não existe
    );
  };

  // 🟢 NOVO: Função para selecionar todas as linhas visíveis na página atual
  const handleSelectAll = () => {
    const todosIdsPagina = atmsExibidos.map(atm => atm.id);
    const todosSelecionados = todosIdsPagina.length > 0 && todosIdsPagina.every(id => selecionados.includes(id));

    if (todosSelecionados) {
      // Se todos da página estão selecionados, desmarca-os
      setSelecionados(prev => prev.filter(id => !todosIdsPagina.includes(id)));
    } else {
      // Se não, marca todos que ainda não estão marcados
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
      
      {/* 🟢 NOVO: Barra de Ações em Lote - Aparece apenas se houver selecionados */}
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
              onClick={() => onOpenBatchEdit && onOpenBatchEdit(selecionados)}
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
                {/* 🟢 NOVO: Aumentamos o colSpan de 11 para 12 para acomodar a checkbox */}
                <th colSpan="12" className="th-group-op">
                  <div className="th-group-content">
                    <span className="th-group-title">DADOS DA OPERAÇÃO</span>
                    <button className="btn-filter-header op" onClick={() => setAbertoFiltroOp(true)} aria-label="Abrir filtros de operação">
                      <FilterIcon size={14} /> Filtros
                    </button>
                  </div>
                </th>

                {/* GRUPO FATURAMENTO */}
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
                {/* 🟢 NOVO: Cabeçalho com a Checkbox de Selecionar Tudo */}
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
                
                // Verifica se está recusado para aplicar a classe CSS correta
                const isRecusado = atm.status?.toLowerCase() === 'recusado';
                
                // 🟢 NOVO: Verifica se a linha atual está na lista de selecionados
                const isSelected = selecionados.includes(atm.id);

                return (
                  <tr 
                    key={atm.id} 
                    // 🟢 NOVO: Adiciona a classe 'linha-selecionada' e mantém a 'linha-recusada'
                    className={`tr-data ${isRecusado ? 'linha-recusada' : ''} ${isSelected ? 'linha-selecionada' : ''}`} 
                    onDoubleClick={() => onOpenAtm(atm)} 
                    style={{ cursor: 'pointer', backgroundColor: isSelected ? '#f5f8ff' : '' }}
                    title="Duplo clique para abrir detalhes"
                  >
                    {/* 🟢 NOVO: Célula com a Checkbox individual */}
                    <td 
                      className="td-id" 
                      style={{ textAlign: 'center', backgroundColor: isSelected ? '#f5f8ff' : '' }} 
                      onClick={(e) => e.stopPropagation()} /* Impede o duplo clique de disparar ao clicar na caixa */
                    >
                       <input 
                         type="checkbox" 
                         checked={isSelected} 
                         onChange={() => handleSelectRow(atm.id)} 
                         style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                       />
                    </td>
                    {/* Mantemos o td-id aqui também para o ID ficar fixo, mas ajustamos o background condicional */}
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