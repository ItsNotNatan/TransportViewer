// src/services/utils.js

/**
 * Retorna uma versão encurtada do ID (8 primeiros caracteres)
 */
export const shortId = (id) => {
  // Se o ID não existir (for null, undefined ou vazio), retorna 'N/A'
  if (!id) {
    return 'N/A';
  }

  // Corta o ID para pegar apenas os primeiros 8 caracteres
  const idCortado = id.substring(0, 8);
  
  // Retorna tudo em letras maiúsculas
  return idCortado.toUpperCase();
};


/**
 * Formata uma string de data (ex: YYYY-MM-DD) para o formato DD/MM/YY
 */
export const formatarDataCurta = (dataStr) => {
  if (!dataStr) {
    return '-';
  }

  // Pega apenas a parte da data, ignorando o horário (ex: "2024-05-20T10:30" vira "2024-05-20")
  const apenasData = dataStr.split('T')[0]; 
  
  // Separa o ano, mês e dia num array
  const partes = apenasData.split('-'); 

  // Se tivermos as 3 partes exatas (ano, mês e dia)
  if (partes.length === 3) {
    const ano = partes[0];
    const mes = partes[1];
    const dia = partes[2];
    
    const anoCurto = ano.substring(2, 4); // Transforma "2024" em "24"
    
    return `${dia}/${mes}/${anoCurto}`;
  }

  // Se a data vier num formato inesperado, apenas devolve como chegou
  return dataStr;
};


/**
 * Formata um valor numérico ou string para o padrão monetário brasileiro (R$)
 */
export const formatarMoeda = (valor) => {
  // Converte o valor que chegou para o tipo Número
  const numero = Number(valor);
  
  // Verifica se o valor não é um número válido (ex: se vier um texto "abc")
  if (Number.isNaN(numero)) {
    return 'R$ 0,00';
  }
  
  // Converte o número para a formatação de dinheiro do Brasil
  return numero.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};


/**
 * Verifica se um valor bate com um filtro de múltipla escolha (separado por vírgulas)
 * Exemplo: Se o valor for "Atrasado" e o filtro for "Entregue, Atrasado" -> Retorna true
 */
export const matchMultiSelect = (valorDoItem, filtro) => {
  // Se o usuário não digitou nenhum filtro, então o item deve aparecer (passa no filtro)
  if (!filtro) {
    return true;
  }

  // Transforma o valor do item em string e em maiúsculas (para evitar erro de letras maiúsculas/minúsculas)
  let textoItem = '';
  if (valorDoItem) {
    textoItem = String(valorDoItem).toUpperCase();
  }

  // Prepara o filtro digitado, também em maiúsculas, e divide pelas vírgulas
  const filtroMaiusculo = filtro.toUpperCase();
  const termosDoFiltro = filtroMaiusculo.split(',');

  // Passa termo por termo procurando se bate com o valor do item
  for (let i = 0; i < termosDoFiltro.length; i++) {
    const termoLimpo = termosDoFiltro[i].trim(); // Tira os espaços em branco
    
    // Se o texto do item conter esse termo específico, passou no filtro
    if (textoItem.includes(termoLimpo)) {
      return true;
    }
  }

  // Se passou por todo o loop e não achou nenhuma correspondência, bloqueia o item
  return false;
};


/**
 * 🟢 ATUALIZADO: Verifica se um valor bate com um filtro de texto simples, múltiplo (vírgulas) ou intervalo (hífen)
 */
export const matchFiltro = (valorDoItem, filtro) => {
  // Se o utilizador não preencheu o filtro, o item é exibido
  if (!filtro) {
    return true;
  }

  // Converte para texto em maiúsculas
  const textoItem = valorDoItem ? String(valorDoItem).toUpperCase() : '';
  const textoFiltro = String(filtro).toUpperCase().trim();

  // 1. MODO ESPECÍFICO: Múltiplas opções separadas por vírgula (ex: "101, 102")
  if (textoFiltro.includes(',')) {
    const termos = textoFiltro.split(',');
    for (let termo of termos) {
      if (textoItem.includes(termo.trim())) {
        return true; // Encontrou pelo menos um dos IDs, mostra a linha!
      }
    }
    return false; // Não tem nenhum dos IDs, esconde a linha
  }

  // 2. MODO LOTE / INTERVALO: Separado por hífen (ex: "100-200")
  // Só consideramos intervalo se houver um hífen e o item não for igual a esse texto exato
  if (textoFiltro.includes('-') && !textoItem.includes(textoFiltro)) {
    const partes = textoFiltro.split('-');
    if (partes.length === 2) {
      const de = partes[0].trim();
      const ate = partes[1].trim();

      // Comparação Numérica (ex: ID 100 até 200)
      if (!isNaN(textoItem) && !isNaN(de) && (!ate || !isNaN(ate))) {
        const numItem = Number(textoItem);
        const numDe = Number(de);
        const numAte = ate ? Number(ate) : Infinity;
        return numItem >= numDe && numItem <= numAte;
      }
      
      // Comparação Alfabética (ex: Pedido A até Pedido Z)
      if (de && ate) return textoItem >= de && textoItem <= ate;
      if (de) return textoItem >= de;
      if (ate) return textoItem <= ate;
    }
  }

  // 3. PESQUISA NORMAL: Apenas um ID ou texto simples
  return textoItem.includes(textoFiltro);
};


/**
 * Verifica se há algum filtro da aba Operação ativo
 */
export const temFiltroOpAtivo = (filtros) => {
  if (filtros.id !== '' || 
      filtros.solicitante !== '' || 
      filtros.pedido !== '' || 
      filtros.nf !== '' || 
      filtros.status !== '' || 
      filtros.transportadora !== '') {
    return true;
  }
  
  return false;
};


/**
 * Verifica se há algum filtro da aba Faturamento ativo
 */
export const temFiltroFatAtivo = (filtros) => {
  if (filtros.fatura !== '' || 
      filtros.elemento_pep !== '' || 
      filtros.registrado_sap !== '' || 
      filtros.tipo_documento !== '') {
    return true;
  }
  
  return false;
};

/**
 * 🟢 NOVO: Compara as datas para o Modo Específico e Lote
 */
export const matchData = (dataAtm, filtroEspecifico, dataInicio, dataFim) => {
  // Se não preencheu nenhuma data no filtro, exibe a linha
  if (!filtroEspecifico && !dataInicio && !dataFim) return true;
  
  // Se preencheu, mas o item não tem data no banco, então esconde-o
  if (!dataAtm) return false;

  const dataBase = dataAtm.split('T')[0]; // Deixa apenas a data pura (ex: "2024-05-20")

  // 1. Modo Específico (Múltiplas datas)
  if (filtroEspecifico) {
    const datasEscolhidas = filtroEspecifico.split(',');
    return datasEscolhidas.includes(dataBase);
  }

  // 2. Modo Lote (Intervalo)
  if (dataInicio || dataFim) {
    // Converte a data do item para um valor numérico para poder comparar quem é maior/menor
    const valorDataAtual = new Date(dataBase).getTime();
    
    // Se não tiver escolhido data início, assume 0. Se não escolher fim, assume infinito
    const valorDataIni = dataInicio ? new Date(dataInicio).getTime() : 0;
    const valorDataFim = dataFim ? new Date(dataFim).getTime() : Infinity;
    
    return valorDataAtual >= valorDataIni && valorDataAtual <= valorDataFim;
  }

  return true;
};

/**
 * 🟢 ATUALIZADO: Agora o sistema sabe que a data também é um filtro da Operação
 */
export const temFiltroOpAtivo = (filtros) => {
  if (filtros.id !== '' || 
      filtros.solicitante !== '' || 
      filtros.pedido !== '' || 
      filtros.nf !== '' || 
      filtros.status !== '' || 
      filtros.transportadora !== '' ||
      filtros.data_especifica !== '' || 
      filtros.data_inicio !== '' ||
      filtros.data_fim !== '') {
    return true;
  }
  
  return false;
};