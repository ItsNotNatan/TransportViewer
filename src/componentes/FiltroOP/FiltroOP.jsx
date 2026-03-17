// src/componentes/FiltroOP/FiltroOP.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';

const XCircle = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);
const X = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function FiltroOP({ atms, filtros, onFiltroChange, onLimpar, aberto, onClose }) {
  const [modoId, setModoId] = useState('especifico');
  const [modoPedido, setModoPedido] = useState('especifico');
  const [modoNf, setModoNf] = useState('especifico');
  const [modoData, setModoData] = useState('lote'); // <-- NOVO: Modo da Data começa como Lote por padrão

  const shortId = (id) => id ? id.substring(0, 8).toUpperCase() : 'N/A';

  const opcoesFiltro = useMemo(() => {
    const ids = new Set();
    const solicitantes = new Set();
    const pedidos = new Set();
    const nfs = new Set();
    const statusList = new Set();
    const transportadoras = new Set();
    const datas = new Set(); // <-- NOVO: Guardar as datas únicas

    atms.forEach(atm => {
      if (atm.numero_atm) ids.add(String(atm.numero_atm));
      else if (atm.id) ids.add(shortId(atm.id)); 
      
      if (atm.solicitacao) solicitantes.add(atm.solicitacao);
      if (atm.pedido_compra) pedidos.add(atm.pedido_compra);
      if (atm.nf) nfs.add(atm.nf);
      if (atm.status) statusList.add(atm.status);
      if (atm.transportadora?.nome) transportadoras.add(atm.transportadora.nome);
      if (atm.data_solicitacao) datas.add(atm.data_solicitacao.split('T')[0]); // Pega só a data YYYY-MM-DD
    });

    const formatarOpcoes = (set) => Array.from(set).filter(Boolean).sort().map(item => ({ value: item, label: item }));

    // Formata a data para exibir bonito na Combo Box (DD/MM/AAAA)
    const formatarOpcoesData = Array.from(datas).sort().map(d => {
      const [ano, mes, dia] = d.split('-');
      return { value: d, label: `${dia}/${mes}/${ano}` };
    });

    return {
      ids: Array.from(ids).sort((a, b) => a.localeCompare(b, undefined, {numeric: true})).map(id => ({ value: id, label: id })),
      solicitantes: formatarOpcoes(solicitantes),
      pedidos: formatarOpcoes(pedidos),
      nfs: formatarOpcoes(nfs),
      status: formatarOpcoes(statusList),
      transportadoras: formatarOpcoes(transportadoras),
      datas: formatarOpcoesData // <-- Passa as opções de datas prontas
    };
  }, [atms]);

  const temFiltroAtivo = [filtros.id, filtros.solicitante, filtros.pedido, filtros.nf, filtros.status, filtros.transportadora, filtros.data_inicio, filtros.data_fim, filtros.data_especifica].some(valor => valor !== '' && valor !== undefined);

  const alternarModo = (campo, modo) => {
    if (campo === 'id') { setModoId(modo); onFiltroChange({ target: { name: 'id', value: '' } }); }
    if (campo === 'pedido') { setModoPedido(modo); onFiltroChange({ target: { name: 'pedido', value: '' } }); }
    if (campo === 'nf') { setModoNf(modo); onFiltroChange({ target: { name: 'nf', value: '' } }); }
    if (campo === 'data') { 
      setModoData(modo); 
      onFiltroChange({ target: { name: 'data_inicio', value: '' } }); 
      onFiltroChange({ target: { name: 'data_fim', value: '' } }); 
      onFiltroChange({ target: { name: 'data_especifica', value: '' } }); 
    }
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    const valores = selectedOptions ? selectedOptions.map(opt => opt.value).join(',') : '';
    onFiltroChange({ target: { name, value: valores } });
  };

  const handleRangeChange = (campo, tipo, selectedOption) => {
    let de = ''; let ate = '';
    if (filtros[campo] && filtros[campo].includes('-')) {
      [de, ate] = filtros[campo].split('-').map(s => s.trim());
    }
    if (tipo === 'de') de = selectedOption ? selectedOption.value : '';
    if (tipo === 'ate') ate = selectedOption ? selectedOption.value : '';
    onFiltroChange({ target: { name: campo, value: (de || ate) ? `${de}-${ate}` : '' } });
  };

  const getMultiValue = (str) => {
    if (!str) return [];
    return str.split(',').filter(Boolean).map(v => ({ value: v.trim(), label: v.trim() }));
  };

  const getMultiValueData = (str) => {
    if (!str) return [];
    return str.split(',').filter(Boolean).map(v => {
      const [ano, mes, dia] = v.trim().split('-');
      return { value: v.trim(), label: `${dia}/${mes}/${ano}` };
    });
  };

  const getRangeValues = (campo, modo) => {
    let currentDe = null; let currentAte = null;
    if (filtros[campo] && modo === 'lote' && filtros[campo].includes('-')) {
      const [de, ate] = filtros[campo].split('-').map(s => s.trim());
      currentDe = de ? { value: de, label: de } : null;
      currentAte = ate ? { value: ate, label: ate } : null;
    }
    return { currentDe, currentAte };
  };

  const rangeId = getRangeValues('id', modoId);
  const rangePedido = getRangeValues('pedido', modoPedido);
  const rangeNf = getRangeValues('nf', modoNf);

  const selectStyles = {
    control: (base) => ({ ...base, borderColor: '#d1d5db', boxShadow: 'none', '&:hover': { borderColor: '#9ca3af' }, borderRadius: '0.375rem', padding: '0.1rem' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#dbeafe', borderRadius: '0.25rem' }),
    multiValueLabel: (base) => ({ ...base, color: '#1e40af', fontWeight: 'bold' }),
    multiValueRemove: (base) => ({ ...base, color: '#1e40af', ':hover': { backgroundColor: '#bfdbfe', color: '#1e3a8a' } }),
  };

  const inputStyle = { width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#ffffff', color: '#111827' };

  if (!aberto) return null;

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content fade-in" style={{ maxWidth: '850px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <span className="modal-subtitle" style={{ fontSize: '0.875rem', color: '#6b7280' }}>Refine sua busca</span>
            <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Filtros da Operação</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.5rem', borderRadius: '0.375rem', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* BLOCO: ID ATM */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>ID ATM</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('id', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoId === 'especifico' ? '#eff6ff' : 'white', borderColor: modoId === 'especifico' ? '#3b82f6' : '#d1d5db', color: modoId === 'especifico' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoId === 'especifico' ? 'bold' : 'normal' }}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('id', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoId === 'lote' ? '#eff6ff' : 'white', borderColor: modoId === 'lote' ? '#3b82f6' : '#d1d5db', color: modoId === 'lote' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoId === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
              </div>
              {modoId === 'especifico' ? (
                <Select isMulti options={opcoesFiltro.ids} value={getMultiValue(filtros.id)} onChange={(opts) => handleMultiSelectChange('id', opts)} placeholder="Selecionar IDs..." styles={selectStyles} />
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.ids} value={rangeId.currentDe} onChange={(opt) => handleRangeChange('id', 'de', opt)} placeholder="De" styles={selectStyles} isClearable /></div>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>até</span>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.ids} value={rangeId.currentAte} onChange={(opt) => handleRangeChange('id', 'ate', opt)} placeholder="Até" styles={selectStyles} isClearable /></div>
                </div>
              )}
            </div>

            {/* BLOCO: PEDIDOS (PC) */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Pedido(s) (PC)</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('pedido', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoPedido === 'especifico' ? '#eff6ff' : 'white', borderColor: modoPedido === 'especifico' ? '#3b82f6' : '#d1d5db', color: modoPedido === 'especifico' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoPedido === 'especifico' ? 'bold' : 'normal' }}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('pedido', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoPedido === 'lote' ? '#eff6ff' : 'white', borderColor: modoPedido === 'lote' ? '#3b82f6' : '#d1d5db', color: modoPedido === 'lote' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoPedido === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
              </div>
              {modoPedido === 'especifico' ? (
                <Select isMulti options={opcoesFiltro.pedidos} value={getMultiValue(filtros.pedido)} onChange={(opts) => handleMultiSelectChange('pedido', opts)} placeholder="Selecionar PCs..." styles={selectStyles} />
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.pedidos} value={rangePedido.currentDe} onChange={(opt) => handleRangeChange('pedido', 'de', opt)} placeholder="De" styles={selectStyles} isClearable /></div>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>até</span>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.pedidos} value={rangePedido.currentAte} onChange={(opt) => handleRangeChange('pedido', 'ate', opt)} placeholder="Até" styles={selectStyles} isClearable /></div>
                </div>
              )}
            </div>

            {/* BLOCO: NOTAS FISCAIS (NF) */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Nota(s) Fiscal (NF)</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('nf', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoNf === 'especifico' ? '#eff6ff' : 'white', borderColor: modoNf === 'especifico' ? '#3b82f6' : '#d1d5db', color: modoNf === 'especifico' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoNf === 'especifico' ? 'bold' : 'normal' }}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('nf', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoNf === 'lote' ? '#eff6ff' : 'white', borderColor: modoNf === 'lote' ? '#3b82f6' : '#d1d5db', color: modoNf === 'lote' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoNf === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
              </div>
              {modoNf === 'especifico' ? (
                <Select isMulti options={opcoesFiltro.nfs} value={getMultiValue(filtros.nf)} onChange={(opts) => handleMultiSelectChange('nf', opts)} placeholder="Selecionar NFs..." styles={selectStyles} />
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.nfs} value={rangeNf.currentDe} onChange={(opt) => handleRangeChange('nf', 'de', opt)} placeholder="De" styles={selectStyles} isClearable /></div>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>até</span>
                  <div style={{ flex: 1 }}><Select options={opcoesFiltro.nfs} value={rangeNf.currentAte} onChange={(opt) => handleRangeChange('nf', 'ate', opt)} placeholder="Até" styles={selectStyles} isClearable /></div>
                </div>
              )}
            </div>

            {/* BLOCO: DATAS (AGORA COM ALTERNÂNCIA!) */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Período da Solicitação</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button type="button" onClick={() => alternarModo('data', 'especifico')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoData === 'especifico' ? '#eff6ff' : 'white', borderColor: modoData === 'especifico' ? '#3b82f6' : '#d1d5db', color: modoData === 'especifico' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoData === 'especifico' ? 'bold' : 'normal' }}>Específicos</button>
                  <button type="button" onClick={() => alternarModo('data', 'lote')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid', backgroundColor: modoData === 'lote' ? '#eff6ff' : 'white', borderColor: modoData === 'lote' ? '#3b82f6' : '#d1d5db', color: modoData === 'lote' ? '#1d4ed8' : '#6b7280', cursor: 'pointer', fontWeight: modoData === 'lote' ? 'bold' : 'normal' }}>Intervalo</button>
                </div>
               </div>
               
               {modoData === 'especifico' ? (
                 <Select isMulti options={opcoesFiltro.datas} value={getMultiValueData(filtros.data_especifica)} onChange={(opts) => handleMultiSelectChange('data_especifica', opts)} placeholder="Selecionar dias..." styles={selectStyles} noOptionsMessage={() => "Nenhuma data encontrada"} />
               ) : (
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}><input type="date" name="data_inicio" value={filtros.data_inicio || ''} onChange={onFiltroChange} style={inputStyle} /></div>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 'bold' }}>até</span>
                    <div style={{ flex: 1 }}><input type="date" name="data_fim" value={filtros.data_fim || ''} onChange={onFiltroChange} style={inputStyle} /></div>
                 </div>
               )}
            </div>

            {/* BLOCO: STATUS */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Status</label>
                <span style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold' }}>Específicos (Tags)</span>
               </div>
              <Select isMulti options={opcoesFiltro.status} value={getMultiValue(filtros.status)} onChange={(opts) => handleMultiSelectChange('status', opts)} placeholder="Ex: Entregue..." styles={selectStyles} />
            </div>

            {/* BLOCO: TRANSPORTADORA */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Transportadora</label>
                <span style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold' }}>Específicos (Tags)</span>
               </div>
              <Select isMulti options={opcoesFiltro.transportadoras} value={getMultiValue(filtros.transportadora)} onChange={(opts) => handleMultiSelectChange('transportadora', opts)} placeholder="Selecionar Transportadoras..." styles={selectStyles} />
            </div>

            {/* BLOCO: SOLICITANTE */}
            <div style={{ gridColumn: 'span 2', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563', margin: 0 }}>Solicitante(s)</label>
                <span style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '0.25rem', border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold' }}>Específicos (Tags)</span>
               </div>
              <Select isMulti options={opcoesFiltro.solicitantes} value={getMultiValue(filtros.solicitante)} onChange={(opts) => handleMultiSelectChange('solicitante', opts)} placeholder="Selecionar Solicitantes..." styles={selectStyles} />
            </div>

          </div>

        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '1rem 1.5rem' }}>
          <div>
            {temFiltroAtivo ? (
              <button onClick={() => { onLimpar(); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>
                <XCircle size={16} /> Limpar Filtros
              </button>
            ) : <div />}
          </div>
          <button onClick={onClose} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Ver Resultados
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}