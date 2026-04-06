import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // O seu axios configurado
import './EditorVeiculos.css';

// --- Ícones ---
const Plus = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Save = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const Trash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

export default function EditorVeiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);

  // NOVO: Controle da unidade de medida atual (m ou cm)
  const [unidade, setUnidade] = useState('m');

  const [formData, setFormData] = useState({
    nome: '',
    comprimento: '',
    largura: '',
    altura: ''
  });

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    setCarregando(true);
    try {
      const response = await api.get('/admin/veiculos');
      setVeiculos(response.data);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      alert("Falha ao carregar a lista de veículos.");
    } finally {
      setCarregando(false);
    }
  };

  const handleSelect = (v) => {
    setSelecionado(v);
    setUnidade('m'); // Ao selecionar um veículo do banco, voltamos para metros (padrão)
    setFormData({
      nome: v.nome,
      comprimento: v.comprimento,
      largura: v.largura,
      altura: v.altura
    });
  };

  const handleNovo = () => {
    setSelecionado(null);
    setUnidade('m'); // Reseta a unidade para o padrão
    setFormData({ nome: '', comprimento: '', largura: '', altura: '' });
  };

  // NOVO: Função para trocar a unidade e converter os valores já digitados
  const handleTrocarUnidade = (novaUnidade) => {
    if (unidade === novaUnidade) return;
    
    setUnidade(novaUnidade);

    setFormData(prev => {
      const c = parseFloat(prev.comprimento);
      const l = parseFloat(prev.largura);
      const a = parseFloat(prev.altura);

      return {
        ...prev,
        comprimento: c ? (novaUnidade === 'cm' ? (c * 100).toFixed(0) : (c / 100).toFixed(2)) : '',
        largura: l ? (novaUnidade === 'cm' ? (l * 100).toFixed(0) : (l / 100).toFixed(2)) : '',
        altura: a ? (novaUnidade === 'cm' ? (a * 100).toFixed(0) : (a / 100).toFixed(2)) : '',
      };
    });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      // NOVO: Antes de salvar, garantimos que os dados vão em metros para o banco
      let comp = parseFloat(formData.comprimento);
      let larg = parseFloat(formData.largura);
      let alt = parseFloat(formData.altura);

      if (unidade === 'cm') {
        comp = comp / 100;
        larg = larg / 100;
        alt = alt / 100;
      }

      const payload = {
        nome: formData.nome,
        comprimento: comp,
        largura: larg,
        altura: alt,
        ativo: true 
      };

      if (selecionado) {
        await api.put(`/admin/veiculos/${selecionado.id}`, payload);
        alert("Veículo atualizado com sucesso!");
      } else {
        await api.post('/admin/veiculos', payload);
        alert("Novo veículo cadastrado!");
      }
      
      fetchVeiculos();
      handleNovo();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados do veículo. Verifique o console.");
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este veículo?")) return;
    try {
      await api.delete(`/admin/veiculos/${id}`);
      fetchVeiculos();
      handleNovo();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir veículo.");
    }
  };

  // Ajustado: O volume sempre é em metros cúbicos, então convertemos se estiver em 'cm'
  const calcularVolume = () => {
    let c = parseFloat(formData.comprimento) || 0;
    let l = parseFloat(formData.largura) || 0;
    let a = parseFloat(formData.altura) || 0;
    
    if (unidade === 'cm') {
      c /= 100;
      l /= 100;
      a /= 100;
    }
    
    return (c * l * a).toFixed(2);
  };

  return (
    <div className="editor-veiculos-page fade-in">
      <div className="editor-container">
        
        {/* LISTA DE VEÍCULOS (Esquerda) */}
        <aside className="veiculos-list-panel">
          <div className="panel-header">
            <h3>Frota Cadastrada</h3>
            <button className="btn-icon-add" onClick={handleNovo} title="Adicionar Novo">
              <Plus />
            </button>
          </div>
          
          <div className="list-scroll">
            {carregando ? <p className="msg-status">Carregando...</p> : 
              veiculos.length === 0 ? <p className="msg-status">Nenhum veículo cadastrado.</p> :
              veiculos.map(v => (
                <div 
                  key={v.id} 
                  className={`veiculo-card-item ${selecionado?.id === v.id ? 'active' : ''}`}
                  onClick={() => handleSelect(v)}
                >
                  <div className="v-info">
                    <strong>{v.nome}</strong>
                    <span>{v.comprimento}m x {v.largura}m x {v.altura}m</span>
                  </div>
                  <button type="button" className="btn-del-small" onClick={(e) => { e.stopPropagation(); handleExcluir(v.id); }}>
                    <Trash />
                  </button>
                </div>
              ))
            }
          </div>
        </aside>

        {/* FORMULÁRIO DE EDIÇÃO (Direita) */}
        <main className="veiculo-form-panel">
          <div className="panel-header">
            <h3>{selecionado ? `Editando: ${selecionado.nome}` : 'Cadastrar Novo Veículo'}</h3>
          </div>

          <form onSubmit={handleSalvar} className="form-edit-v">
            <div className="form-row-full">
              <label>Nome do Modelo / Tipo</label>
              <input 
                type="text" 
                required 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
                placeholder="Ex: Carreta LS, Truck, Fiorino..."
              />
            </div>

            {/* NOVO: Botões para escolher a unidade */}
            <div className="unit-toggle-container">
              <label>Unidade de Medida</label>
              <div className="unit-buttons">
                <button 
                  type="button" 
                  className={unidade === 'm' ? 'active' : ''} 
                  onClick={() => handleTrocarUnidade('m')}
                >
                  Metros (m)
                </button>
                <button 
                  type="button" 
                  className={unidade === 'cm' ? 'active' : ''} 
                  onClick={() => handleTrocarUnidade('cm')}
                >
                  Centímetros (cm)
                </button>
              </div>
            </div>

            <div className="form-grid-dimensions">
              <div className="field-group">
                <label>Comprimento ({unidade})</label>
                <input 
                  type="number" step={unidade === 'm' ? "0.01" : "1"} min="0.1" required 
                  value={formData.comprimento} 
                  onChange={e => setFormData({...formData, comprimento: e.target.value})} 
                />
              </div>
              <div className="field-group">
                <label>Largura ({unidade})</label>
                <input 
                  type="number" step={unidade === 'm' ? "0.01" : "1"} min="0.1" required 
                  value={formData.largura} 
                  onChange={e => setFormData({...formData, largura: e.target.value})} 
                />
              </div>
              <div className="field-group">
                <label>Altura ({unidade})</label>
                <input 
                  type="number" step={unidade === 'm' ? "0.01" : "1"} min="0.1" required 
                  value={formData.altura} 
                  onChange={e => setFormData({...formData, altura: e.target.value})} 
                />
              </div>
            </div>

            <div className="volume-preview-card">
              <span>Volume Máximo Estimado:</span>
              <strong>
                {calcularVolume()} m³
              </strong>
            </div>

            <div className="form-actions-v">
              <button type="button" className="btn-cancel" onClick={handleNovo}>Cancelar</button>
              <button type="submit" className="btn-save-v">
                <Save /> {selecionado ? 'Salvar Alterações' : 'Cadastrar Veículo'}
              </button>
            </div>
          </form>
        </main>

      </div>
    </div>
  );
}