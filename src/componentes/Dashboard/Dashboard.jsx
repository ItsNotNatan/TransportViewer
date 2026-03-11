// src/componentes/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import Filtro from '../Filtro/Filtro'; 
import * as XLSX from 'xlsx';

// --- Ícones SVG ---
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;
const DownloadIcon = ({ size = 20, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

export default function Dashboard({ atms, carregando, onOpenAtm }) {
  const [filtros, setFiltros] = useState({ id: '', solicitante: '', pedido: '', nf: '' });

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({ id: '', solicitante: '', pedido: '', nf: '' });
  };

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  const formatarDataCurta = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0].substring(2,4)}`; 
    return dataStr;
  };

  const atmsFiltrados = atms.filter(atm => {
    const idCurtoAtm = shortId(atm.id);
    const matchId = !filtros.id || idCurtoAtm.includes(filtros.id.toUpperCase().trim());
    const matchSolicitante = !filtros.solicitante || atm.solicitacao?.toLowerCase().includes(filtros.solicitante.toLowerCase().trim());
    const matchPedido = !filtros.pedido || atm.pedido_compra?.toLowerCase().includes(filtros.pedido.toLowerCase().trim());
    const matchNf = !filtros.nf || atm.nf?.toLowerCase().includes(filtros.nf.toLowerCase().trim());
    return matchId && matchSolicitante && matchPedido && matchNf;
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  // ========================================================
  // LÓGICA DE EXPORTAÇÃO PARA EXCEL MODO "ORIGINAL"
  // ========================================================
  const exportarExcel = () => {
    if (atmsFiltrados.length === 0) {
      alert("Não há dados para exportar com os filtros atuais.");
      return;
    }

    // 1. Organiza os dados EXACTAMENTE com os nomes da sua planilha original
    const dadosFormatados = atmsFiltrados.map(atm => {
      // Cria a rota automática "Origem x Destino"
      const rotaStr = (atm.origem?.municipio && atm.destino?.municipio) 
        ? `${atm.origem.uf} ${atm.origem.municipio} x ${atm.destino.municipio} ${atm.destino.uf}`
        : '-';

      return {
        "DATA DA SOLICITAÇÃO": atm.data_solicitacao ? atm.data_solicitacao.split('T')[0] : '-',
        "ATM": atm.numero_atm || shortId(atm.id),
        "PEDIDO DE COMPRA": atm.pedido_compra || '-',
        "NF": atm.nf || '-',
        "WBS": atm.wbs || '-',
        "UF": atm.origem?.uf || '-',
        "MUNICIPIO": atm.origem?.municipio || '-',
        "LOCAL DE COLETA": atm.origem?.nome_local || '-',
        "X": "x", // Coluna de separação que existe no seu excel
        "LOCAL DA ENTREGA": atm.destino?.nome_local || '-',
        "UF 2": atm.destino?.uf || '-',
        "MUNICIPIO 2": atm.destino?.municipio || '-',
        "Fracionado/Dedicado": atm.tipo_frete || '-',
        "SOLICITAÇÃO": atm.solicitacao || '-',
        "VEÍCULO": atm.veiculo || atm.modal || '-',
        "TRANSPORTADORA": atm.transportadora?.nome || '-',
        "COTAÇÃO/BID": atm.cotacao_bid ? "Cotação" : (atm.valor_bid ? "BID" : '-'),
        "VALOR NF": atm.valor_nf || '-',
        "VOLUME": atm.volume || '-',
        "PESO": atm.peso || '-',
        "VALOR BID (Dedicado)": atm.valor_bid_dedicado || '-',
        "DATA DE ENTREGA": atm.data_entrega ? atm.data_entrega.split('T')[0] : '-',
        "STATUS": atm.status || '-',
        "OBSERVAÇÕES": atm.observacoes || '-',
        "Valor BID": atm.valor_bid || atm.cotacao_bid || '-',
        "ROTA": rotaStr,
        "TIPO": atm.tipo_documento || '-',
        "DATA MAPEAMENTO": atm.data_mapeamento ? atm.data_mapeamento.split('T')[0] : '-',
        "CTE": atm.fatura_cte || '-',
        "VALOR": atm.valor || '-',
        "DATA EMISSÃO": atm.data_emissao ? atm.data_emissao.split('T')[0] : '-',
        "VENCIMENTO": atm.vencimento ? atm.vencimento.split('T')[0] : '-',
        "ELEMENTO PEP - CC / WBS": atm.elemento_pep_cc_wbs || '-',
        "VALIDAÇÃO PEP - CC /WBS": atm.validacao_pep || '-',
        "Registrado SAP (S/N)": atm.registrado_sap || '-',
        "Registro SAP": atm.registro_sap || '-',
        "Lançamento FI (S/N)": atm.lancamento_fi || '-',
        "Processo lançamento FI": atm.processo_lancamento_fi || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    
    // 2. Define o tamanho das colunas (Estilo do Excel) para não ficar esmagado
    worksheet['!cols'] = [
      { wch: 18 }, // DATA DA SOLICITAÇÃO
      { wch: 10 }, // ATM
      { wch: 18 }, // PEDIDO DE COMPRA
      { wch: 12 }, // NF
      { wch: 15 }, // WBS
      { wch: 5 },  // UF
      { wch: 20 }, // MUNICIPIO
      { wch: 25 }, // LOCAL DE COLETA
      { wch: 3 },  // X
      { wch: 25 }, // LOCAL DA ENTREGA
      { wch: 5 },  // UF 2
      { wch: 20 }, // MUNICIPIO 2
      { wch: 20 }, // Fracionado/Dedicado
      { wch: 15 }, // SOLICITAÇÃO
      { wch: 15 }, // VEÍCULO
      { wch: 20 }, // TRANSPORTADORA
      { wch: 15 }, // COTAÇÃO/BID
      { wch: 12 }, // VALOR NF
      { wch: 10 }, // VOLUME
      { wch: 10 }, // PESO
      { wch: 15 }, // VALOR BID (Dedicado)
      { wch: 18 }, // DATA DE ENTREGA
      { wch: 15 }, // STATUS
      { wch: 40 }, // OBSERVAÇÕES
      { wch: 15 }, // Valor BID
      { wch: 40 }, // ROTA
      { wch: 10 }, // TIPO
      { wch: 18 }, // DATA MAPEAMENTO
      { wch: 15 }, // CTE
      { wch: 15 }, // VALOR
      { wch: 15 }, // DATA EMISSÃO
      { wch: 15 }, // VENCIMENTO
      { wch: 25 }, // ELEMENTO PEP
      { wch: 25 }, // VALIDAÇÃO PEP
      { wch: 15 }, // Registrado SAP
      { wch: 15 }, // Registro SAP
      { wch: 15 }, // Lançamento FI
      { wch: 20 }  // Processo lançamento FI
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gestão de Fretes - ATM");
    
    // Baixa o ficheiro
    XLSX.writeFile(workbook, "Gestao_de_Fretes_ATMLOG.xlsx");
  };

  return (
    <section className="fade-in section-dashboard">
      
      {/* CABEÇALHO */}
      <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          <TableList size={24} className="text-primary" /> Painel de Controle (Logística e Faturamento)
        </h3>
        
        {/* BOTÃO EXPORTAR EXCEL */}
        <button 
          onClick={exportarExcel} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
          title="Baixar Tabela no Formato Original"
        >
          <DownloadIcon size={18} /> Exportar Gestão de Fretes
        </button>
      </div>

      {/* COMPONENTE DE FILTRO */}
      <div style={{ marginBottom: '1rem' }}>
        <Filtro 
          atms={atms}
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onLimpar={limparFiltros}
        />
      </div>
      
      {/* TABELA DE DADOS NA TELA (Resumo visual, não muda) */}
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ whiteSpace: 'nowrap', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th colSpan="8" style={{ borderRight: '2px solid #e5e7eb', textAlign: 'center', color: '#1e3a8a' }}>DADOS DA OPERAÇÃO</th>
              <th colSpan="8" style={{ textAlign: 'center', color: '#047857' }}>FATURAMENTO / SAP</th>
              <th style={{ backgroundColor: '#f9fafb' }}></th>
            </tr>
            <tr>
              <th>ID ATM</th><th>Solicitante</th><th>Pedido</th><th>NF</th><th>Rota</th><th>T. Frete</th><th>Veículo</th><th style={{ borderRight: '2px solid #e5e7eb' }}>Status</th>
              <th>Tipo Doc.</th><th>Data Map.</th><th>Fatura CT-e</th><th>Valor (R$)</th><th>Emissão/Venc.</th><th>Elem. PEP/WBS</th><th>Valid. PEP</th><th>SAP (S/N) / Cód</th>
              <th style={{ position: 'sticky', right: 0, backgroundColor: '#f9fafb', zIndex: 10, borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan="17" className="text-center" style={{padding: '2rem'}}>Carregando dados...</td></tr>
            ) : atmsFiltrados.length === 0 ? (
              <tr><td colSpan="17" className="text-center" style={{padding: '2rem', color: '#6b7280'}}>Nenhum resultado encontrado com os filtros atuais.</td></tr>
            ) : atmsFiltrados.map((atm) => (
              <tr key={atm.id}>
                <td className="font-bold" title={atm.id}>#{shortId(atm.id)}</td>
                <td>{atm.solicitacao || '-'}</td><td>{atm.pedido_compra || '-'}</td><td>{atm.nf || '-'}</td>
                <td style={{ fontSize: '0.8rem' }}>De: {atm.origem?.municipio}<br/>Para: {atm.destino?.municipio}</td>
                <td>{atm.tipo_frete || '-'}</td><td>{atm.veiculo || '-'}</td>
                <td style={{ borderRight: '2px solid #e5e7eb' }}><span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span></td>
                
                <td>{atm.tipo_documento || '-'}</td><td>{formatarDataCurta(atm.data_mapeamento)}</td>
                <td className="font-bold text-gray-700">{atm.fatura_cte || '-'}</td>
                <td className="text-green-600 font-bold">{(atm.valor || atm.valor_nf) ? Number(atm.valor || atm.valor_nf).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '-'}</td>
                <td style={{ fontSize: '0.85rem' }}>E: {formatarDataCurta(atm.data_emissao)}<br/>V: <strong className="text-red-600">{formatarDataCurta(atm.vencimento)}</strong></td>
                <td>{atm.elemento_pep_cc_wbs || atm.wbs || '-'}</td><td>{atm.validacao_pep || '-'}</td>
                <td>
                  <span className={atm.registrado_sap === 'SIM' ? 'text-green-600 font-bold' : 'text-gray-400'}>{atm.registrado_sap || 'NÃO'}</span><br/>
                  <span style={{ fontSize: '0.8rem' }}>{atm.registro_sap || '-'}</span>
                </td>
                
                <td style={{ position: 'sticky', right: 0, backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                  <button className="btn-action" onClick={() => onOpenAtm(atm)}>
                    <FolderOpen size={16} /> Abrir Ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}