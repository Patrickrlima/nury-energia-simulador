import { jsPDF } from 'jspdf';
import { EMPRESA, TEXTOS_LEGAIS } from '../config/solarConfig';
import type { ResultadoPayback, ResultadoSimulacao } from '../types/solar';
import { formatarMoeda, formatarNumero } from '../utils/currency';

/**
 * Geração de PDF da simulação — desenhado vetorialmente com jsPDF (não é
 * captura de tela), para manter aparência nítida de proposta comercial.
 */

const COR_NAVY: [number, number, number] = [8, 32, 50];
const COR_TEAL: [number, number, number] = [11, 143, 134];
const COR_SUN: [number, number, number] = [246, 168, 33];
const COR_INK: [number, number, number] = [11, 27, 38];
const COR_SLATE: [number, number, number] = [76, 98, 115];
const COR_MIST: [number, number, number] = [243, 248, 251];
const COR_WHITE: [number, number, number] = [255, 255, 255];

function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function gerarPdfSimulacao(resultado: ResultadoSimulacao, payback?: ResultadoPayback | null): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = 0;

  // ---- Cabeçalho ----
  doc.setFillColor(...COR_NAVY);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setFillColor(...COR_SUN);
  doc.circle(pageW - 26, 14, 9, 'F');
  doc.setFillColor(...COR_NAVY);
  doc.circle(pageW - 26, 14, 9, 'S');

  doc.setTextColor(...COR_WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(EMPRESA.nome, margin, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(230, 240, 245);
  doc.text('Simulação preliminar de sistema fotovoltaico', margin, 26);
  doc.setFontSize(9);
  doc.text(`${EMPRESA.site}  •  ${EMPRESA.cidadeSede}/${EMPRESA.estadoSede}`, margin, 33);

  y = 50;

  // ---- Dados do cliente ----
  doc.setTextColor(...COR_INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Dados do cliente', margin, y);
  y += 7;

  const cliente = resultado.parametros.cliente;
  const linhasCliente: [string, string][] = [
    ['Cliente', cliente.nome || '-'],
    ['Cidade', `${cliente.cidade}${cliente.estado ? '/' + cliente.estado : ''}`],
    ['Tipo de instalação', capitalizar(cliente.tipoInstalacao)],
    ['Data da simulação', formatarData(new Date())],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  linhasCliente.forEach(([label, valor], i) => {
    const cx = margin + (i % 2) * ((pageW - margin * 2) / 2);
    const cy = y + Math.floor(i / 2) * 8;
    doc.setTextColor(...COR_SLATE);
    doc.text(`${label}:`, cx, cy);
    doc.setTextColor(...COR_INK);
    doc.setFont('helvetica', 'bold');
    doc.text(valor, cx + 34, cy);
    doc.setFont('helvetica', 'normal');
  });
  y += 22;

  // ---- Consumo e conta ----
  y = desenharCardsResumo(doc, resultado, margin, y, pageW);

  // ---- Sistema estimado ----
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COR_INK);
  doc.text('Sistema fotovoltaico estimado', margin, y);
  y += 4;

  const cardW = (pageW - margin * 2 - 12) / 4;
  const cards: [string, string, string][] = [
    ['SISTEMA', `${formatarNumero(resultado.potenciaTotalInstaladaKwp, 2)} kWp`, 'Potência estimada'],
    ['PAINÉIS', `${resultado.numeroDeModulos}`, `módulos de ${resultado.potenciaModuloWp} Wp`],
    ['GERAÇÃO', `${formatarNumero(resultado.geracaoMensalEstimadaKwh)} kWh`, 'estimados por mês'],
    ['ECONOMIA', formatarMoeda(resultado.economiaMensalEstimada), 'estimada por mês'],
  ];

  cards.forEach(([label, valor, sub], i) => {
    const cx = margin + i * (cardW + 4);
    doc.setFillColor(...COR_MIST);
    doc.roundedRect(cx, y + 2, cardW, 26, 2, 2, 'F');
    doc.setTextColor(...COR_TEAL);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(label, cx + 4, y + 9);
    doc.setTextColor(...COR_INK);
    doc.setFontSize(12.5);
    doc.text(valor, cx + 4, y + 17);
    doc.setTextColor(...COR_SLATE);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(sub, cx + 4, y + 23);
  });
  y += 34;

  // ---- Economia anual + acumulada ----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COR_INK);
  doc.text('Economia estimada ao longo do tempo', margin, y);
  y += 8;

  doc.setFillColor(...COR_NAVY);
  doc.roundedRect(margin, y, pageW - margin * 2, 16, 2, 2, 'F');
  doc.setTextColor(...COR_WHITE);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Economia anual estimada', margin + 5, y + 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(formatarMoeda(resultado.economiaAnualEstimada), margin + 5, y + 12.5);
  y += 22;

  const colW = (pageW - margin * 2) / resultado.economiaAcumulada.length;
  doc.setDrawColor(220, 228, 233);
  doc.line(margin, y, pageW - margin, y);
  y += 6;
  resultado.economiaAcumulada.forEach((ponto, i) => {
    const cx = margin + i * colW;
    doc.setTextColor(...COR_SLATE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ponto.anos} ano${ponto.anos > 1 ? 's' : ''}`, cx, y, { maxWidth: colW - 2 });
    doc.setTextColor(...COR_INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(formatarMoeda(ponto.valorAcumulado), cx, y + 6, { maxWidth: colW - 2 });
  });
  y += 16;

  // ---- Payback (se informado) ----
  if (payback?.paybackAnosEstimado) {
    doc.setFillColor(...COR_MIST);
    doc.roundedRect(margin, y, pageW - margin * 2, 18, 2, 2, 'F');
    doc.setTextColor(...COR_INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('Payback estimado', margin + 5, y + 7.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COR_SLATE);
    doc.text(
      `Considerando investimento de ${formatarMoeda(payback.valorEstimadoSistema)}, o retorno estimado é de ${formatarNumero(
        payback.paybackAnosEstimado,
        1
      )} anos.`,
      margin + 5,
      y + 13.5,
      { maxWidth: pageW - margin * 2 - 10 }
    );
    y += 24;
  }

  // ---- Rodapé / avisos legais ----
  const footerY = pageH - 30;
  doc.setDrawColor(220, 228, 233);
  doc.line(margin, footerY, pageW - margin, footerY);
  doc.setTextColor(...COR_SLATE);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text(TEXTOS_LEGAIS.avisoPdf, margin, footerY + 6, { maxWidth: pageW - margin * 2 });
  doc.text(TEXTOS_LEGAIS.avisoGeral, margin, footerY + 14, { maxWidth: pageW - margin * 2 });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COR_SLATE);
  doc.text(`${EMPRESA.nome} — proposta gerada automaticamente`, margin, pageH - 6);

  const nomeArquivo = `simulacao-${slugify(cliente.nome || 'cliente')}.pdf`;
  doc.save(nomeArquivo);
}

function desenharCardsResumo(doc: jsPDF, resultado: ResultadoSimulacao, margin: number, y: number, pageW: number): number {
  doc.setFillColor(...COR_MIST);
  doc.roundedRect(margin, y, pageW - margin * 2, 18, 2, 2, 'F');

  const itens: [string, string][] = [
    ['Consumo médio mensal', `${formatarNumero(resultado.consumoMensalEstimadoKwh)} kWh`],
    ['Valor médio da conta', formatarMoeda(resultado.valorContaAtual)],
    ['Conta estimada com solar', formatarMoeda(resultado.contaEstimadaComSolar)],
  ];
  const colW = (pageW - margin * 2) / itens.length;

  itens.forEach(([label, valor], i) => {
    const cx = margin + i * colW + 4;
    doc.setTextColor(...COR_SLATE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, cx, y + 7);
    doc.setTextColor(...COR_INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(valor, cx, y + 14);
  });

  return y + 24;
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
