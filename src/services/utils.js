// services/utils.js

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
 * Verifica se um valor bate com um filtro de texto simples
 */
export const matchFiltro = (valorDoItem, filtro) => {
  // Se o usuário não preencheu o filtro, o item é exibido
  if (!filtro) {
    return true;
  }

  // Converte o item e o filtro para texto em maiúsculas para não ter erro de case sensitive
  let textoItem = '';
  if (valorDoItem) {
    textoItem = String(valorDoItem).toUpperCase();
  }

  const textoFiltro = String(filtro).toUpperCase().trim();

  // Verifica se o texto do item contém o texto do filtro
  if (textoItem.includes(textoFiltro)) {
    return true;
  } else {
    return false;
  }
};


/**
 * Verifica se há algum filtro da aba Operação ativo
 * Substituímos o uso de '!!' por comparações diretas para ficar mais legível
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