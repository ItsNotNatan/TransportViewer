// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import CardExpandido from '../../componentes/CardExpandido/CardExpandido'; 

// --- Ícones SVG embutidos ---
const Search = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>;
const TableList = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/></svg>;
const FolderOpen = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>;

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtm, setSelectedAtm] = useState(null);
  const [atms, setAtms] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarPedidos();
  }, []);

  const buscarPedidos = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch('http://localhost:3001/api/admin/transportes');
      const dados = await resposta.json();
      if (resposta.ok) setAtms(dados);
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  const atmsFiltrados = atms.filter(atm => {
    if (!searchTerm) return true; 
    const termo = searchTerm.toLowerCase();
    return (
      atm.pedido_compra?.toLowerCase().includes(termo) || 
      atm.nf?.toLowerCase().includes(termo) || 
      atm.wbs?.toLowerCase().includes(termo) ||
      atm.id?.toLowerCase().includes(termo) ||
      atm.fatura_cte?.toLowerCase().includes(termo) || // Busca por Fatura
      atm.registro_sap?.toLowerCase().includes(termo)  // Busca por Cód. SAP
    );
  });

  const getStatusClass = (status) => {
    if (status === 'Entregue') return 'badge-success';
    if (status === 'Aguardando Aprovação') return 'badge-warning';
    return 'badge-info';
  };

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  // Função auxiliar de data simplificada para caber na tabela
  const formatarDataCurta = (dataStr) => {
    if (!dataStr) return '-';
    const partes = dataStr.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0].substring(2,4)}`; // Retorna 10/03/26
    return dataStr;
  };

  return (
    <>
      <section className="fade-in section-dashboard">
        <div className="section-header">
          <h3 className="section-title"><TableList size={24} className="text-primary" /> Painel de Controle (Logística e Faturamento)</h3>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Buscar ID, NF, Pedido, Fatura, SAP..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        
        {/* A table-container costuma ter overflow-x: auto no CSS para scroll horizontal */}
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th colSpan="8" style={{ borderRight: '2px solid #e5e7eb', textAlign: 'center', color: '#1e3a8a' }}>DADOS DA OPERAÇÃO</th>
                <th colSpan="8" style={{ textAlign: 'center', color: '#047857' }}>FATURAMENTO / SAP</th>
                <th></th>
              </tr>
              <tr>
                {/* BLOCO: OPERAÇÃO */}
                <th>ID ATM</th>
                <th>Solicitante</th>
                <th>Pedido</th>
                <th>NF</th>
                <th>Rota</th>
                <th>T. Frete</th>
                <th>Veículo</th>
                <th style={{ borderRight: '2px solid #e5e7eb' }}>Status</th>
                
                {/* BLOCO: FATURAMENTO E SAP (Os campos novos) */}
                <th>Tipo Doc.</th>
                <th>Data Map.</th>
                <th>Fatura CT-e</th>
                <th>Valor (R$)</th>
                <th>Emissão/Venc.</th>
                <th>Elem. PEP/WBS</th>
                <th>Valid. PEP</th>
                <th>SAP (S/N) / Cód</th>
                
                {/* AÇÕES */}
                <th style={{ position: 'sticky', right: 0, backgroundColor: '#f9fafb' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (<tr><td colSpan="17" className="text-center" style={{padding: '2rem'}}>Carregando...</td></tr>) : atmsFiltrados.map((atm) => (
                <tr key={atm.id}>
                  {/* OPERAÇÃO */}
                  <td className="font-bold" title={atm.id}>#{shortId(atm.id)}</td>
                  <td>{atm.solicitacao || '-'}</td>
                  <td>{atm.pedido_compra || '-'}</td>
                  <td>{atm.nf || '-'}</td>
                  <td style={{ fontSize: '0.8rem' }}>De: {atm.origem?.municipio}<br/>Para: {atm.destino?.municipio}</td>
                  <td>{atm.tipo_frete || '-'}</td>
                  <td>{atm.veiculo || '-'}</td>
                  <td style={{ borderRight: '2px solid #e5e7eb' }}>
                    <span className={`badge ${getStatusClass(atm.status)}`}>{atm.status}</span>
                  </td>

                  {/* FATURAMENTO E SAP */}
                  <td>{atm.tipo_documento || '-'}</td>
                  <td>{formatarDataCurta(atm.data_mapeamento)}</td>
                  <td className="font-bold text-gray-700">{atm.fatura_cte || '-'}</td>
                  <td className="text-green-600 font-bold">
                    {(atm.valor || atm.valor_nf) ? Number(atm.valor || atm.valor_nf).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '-'}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    E: {formatarDataCurta(atm.data_emissao)}<br/>
                    V: <strong className="text-red-600">{formatarDataCurta(atm.vencimento)}</strong>
                  </td>
                  <td>{atm.elemento_pep_cc_wbs || atm.wbs || '-'}</td>
                  <td>{atm.validacao_pep || '-'}</td>
                  <td>
                    <span className={atm.registrado_sap === 'SIM' ? 'text-green-600 font-bold' : 'text-gray-400'}>
                      {atm.registrado_sap || 'NÃO'}
                    </span>
                    <br/>
                    <span style={{ fontSize: '0.8rem' }}>{atm.registro_sap || '-'}</span>
                  </td>

                  {/* AÇÕES */}
                  <td style={{ position: 'sticky', right: 0, backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                    <button className="btn-action" onClick={() => setSelectedAtm(atm)}>
                      <FolderOpen size={16} /> Abrir Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RENDERIZANDO O NOSSO COMPONENTE MODAL */}
      <CardExpandido 
        atm={selectedAtm} 
        onClose={() => setSelectedAtm(null)}
        onAtmUpdated={() => {
          setSelectedAtm(null); 
          buscarPedidos();      
        }} 
      />
    </>
  );
}