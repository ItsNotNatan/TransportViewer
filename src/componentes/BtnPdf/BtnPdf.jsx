import React, { useState } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Inicialização segura das fontes
try {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} catch (e) {
  console.error("Erro ao carregar fontes do PDF:", e);
}

const FileText = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

export default function BtnPdf({ atm }) {
  const [gerando, setGerando] = useState(false);

  // 🛡️ PROTEÇÃO: Se não houver dados do ATM, o botão não renderiza
  // Isso evita que o React tente ler propriedades de "undefined" e apague a tela
  if (!atm) return null;

  const formatarData = (dataStr) => {
    if (!dataStr) return 'N/A';
    const partes = dataStr.split('T')[0].split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
  };

  const handleGerarPdf = () => {
    setGerando(true);

    try {
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
          // CABEÇALHO
          { text: 'ATM - AUTORIZAÇÃO DE TRANSPORTE DE MERCADORIA', style: 'headerMain' },
          { text: 'SISTEMA DE GESTÃO LOGÍSTICA', style: 'headerSub' },
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#eeeeee' }] },
          
          // NÚMERO E TRANSPORTADORA
          {
            margin: [0, 15, 0, 15],
            columns: [
              { text: [{ text: 'Nº ATM: ', bold: true }, atm.numero_atm || (atm.id ? atm.id.substring(0,8).toUpperCase() : 'N/A')] },
              { text: [{ text: 'Transportadora: ', bold: true }, atm.transportadora?.nome || 'A DEFINIR'], alignment: 'right' }
            ]
          },

          // IDENTIFICAÇÃO
          { text: 'IDENTIFICAÇÃO', style: 'sectionTitle' },
          {
            table: {
              widths: ['*'],
              body: [
                [{
                  stack: [
                    { text: [{ text: 'Solicitante: ', bold: true }, atm.solicitacao || 'N/A'] },
                    { text: [{ text: 'Data da Solicitação: ', bold: true }, formatarData(atm.data_solicitacao || atm.created_at)] },
                    { text: [{ text: 'Centro de Custo / WBS: ', bold: true }, atm.wbs || 'N/A'] },
                  ],
                  margin: [5, 5, 5, 5]
                }]
              ]
            },
            layout: 'lightHorizontalLines'
          },

          // COLETA (ORIGEM)
          { text: 'LOCAL DA COLETA (ORIGEM)', style: 'sectionTitle', margin: [0, 15, 0, 5] },
          {
            table: {
              widths: ['*', 120],
              body: [
                [
                  { text: [{ text: 'Endereço de Coleta: ', bold: true }, `${atm.origem?.logradouro || ''}, ${atm.origem?.numero || ''} - ${atm.origem?.municipio || ''}/${atm.origem?.uf || ''}`] },
                  { text: [{ text: 'Data Previsão: ', bold: true }, formatarData(atm.created_at)], alignment: 'right' }
                ]
              ]
            }
          },

          // ENTREGA (DESTINO)
          { text: 'LOCAL DA ENTREGA (DESTINO)', style: 'sectionTitle', margin: [0, 15, 0, 5] },
          {
            table: {
              widths: ['*', 120],
              body: [
                [
                  { text: [{ text: 'Endereço de Entrega: ', bold: true }, `${atm.destino?.logradouro || ''}, ${atm.destino?.numero || ''} - ${atm.destino?.municipio || ''}/${atm.destino?.uf || ''}`] },
                  { text: [{ text: 'Data Previsão: ', bold: true }, formatarData(atm.data_entrega)], alignment: 'right' }
                ]
              ]
            }
          },

          // DADOS MATERIAL E FRETE
          { text: 'DADOS DO MATERIAL E FRETE', style: 'sectionTitle', margin: [0, 15, 0, 5] },
          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  { text: [{ text: 'Peso Estimado: ', bold: true }, atm.peso ? `${atm.peso} kg` : 'N/A'] },
                  { text: [{ text: 'Volume: ', bold: true }, atm.volume ? `${atm.volume} m³` : 'N/A'] },
                  { text: [{ text: 'Tipo Veículo: ', bold: true }, atm.veiculo || 'N/A'] }
                ],
                [
                  { text: [{ text: 'Tipo de Frete: ', bold: true }, atm.tipo_frete || 'N/A'] },
                  { text: [{ text: 'Pedido de Compra: ', bold: true }, atm.pedido_compra || 'N/A'] },
                  { text: [{ text: 'Nota Fiscal: ', bold: true }, atm.nf || 'N/A'] }
                ]
              ]
            }
          },

          // OBSERVAÇÕES
          { text: 'OBSERVAÇÕES', style: 'sectionTitle', margin: [0, 15, 0, 5] },
          {
            table: {
              widths: ['*'],
              heights: 50,
              body: [[{ text: atm.observacoes || 'Nenhuma observação.', fontSize: 9 }]]
            }
          },

          // ASSINATURAS
          {
            margin: [0, 50, 0, 0],
            columns: [
              {
                stack: [
                  { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                  { text: 'ASSINATURA DO SOLICITANTE', style: 'signatureLabel' },
                  { text: 'Documento gerado eletronicamente via ATM Log', fontSize: 7, color: 'gray' }
                ],
                alignment: 'center'
              },
              {
                stack: [
                  { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                  { text: 'VISTO LOGÍSTICA / TRANSPORTADORA', style: 'signatureLabel' },
                  { text: new Date().toLocaleDateString(), fontSize: 7, color: 'gray' }
                ],
                alignment: 'center'
              }
            ]
          }
        ],
        styles: {
          headerMain: { fontSize: 14, bold: true, alignment: 'center', color: '#1a365d' },
          headerSub: { fontSize: 10, alignment: 'center', margin: [0, 2, 0, 10], color: '#718096' },
          sectionTitle: { fontSize: 10, bold: true, color: '#2d3748', margin: [0, 10, 0, 5], background: '#f7fafc' },
          signatureLabel: { fontSize: 8, bold: true, margin: [0, 5, 0, 0] }
        },
        defaultStyle: { fontSize: 9 }
      };

      pdfMake.createPdf(docDefinition).download(`ATM_${atm.numero_atm || 'doc'}.pdf`);
    } catch (error) {
      console.error("Erro detalhado ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Verifique os dados do pedido.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <button 
      onClick={handleGerarPdf}
      disabled={gerando}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', 
        borderRadius: '0.5rem', border: '1px solid #fca5a5', cursor: gerando ? 'not-allowed' : 'pointer', 
        fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#ef4444', transition: 'all 0.2s',
        opacity: gerando ? 0.7 : 1
      }}
    >
      <FileText size={18} /> 
      {gerando ? 'Processando...' : 'Gerar Autorização (PDF)'}
    </button>
  );
}