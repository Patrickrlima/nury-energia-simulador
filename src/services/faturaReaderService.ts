/**
 * "Leitor de fatura" — 100% local, roda inteiro no navegador do
 * vendedor/cliente. SEM IA, SEM servidor próprio, SEM chave de API, SEM
 * cartão de crédito em lugar nenhum:
 *
 * - Foto (imagem): reconhecimento de texto por OCR (Tesseract.js, motor
 *   open-source, gratuito, roda no próprio navegador).
 * - PDF: extração direta do texto já embutido no arquivo (a maioria das
 *   faturas de energia é um PDF "nativo", não uma foto escaneada — nesse
 *   caso a leitura é bem mais confiável que OCR).
 *
 * Depois de obter o texto, procuramos por padrões comuns de fatura
 * brasileira (consumo em kWh, tarifas TE/TU, valor total). É uma leitura
 * "melhor esforço": como cada distribuidora formata a fatura de um jeito,
 * o resultado deve sempre ser conferido pelo vendedor antes de simular —
 * por isso os campos continuam editáveis manualmente depois da leitura.
 */

export interface DadosExtraidosFatura {
  /** Consumo do mês em kWh, ou null se não foi possível identificar. */
  consumoKwh: number | null;
  /**
   * Tarifa efetiva média (R$/kWh, já com impostos) — soma de todos os
   * componentes de energia (ex.: TE + TU) dividida pelo consumo. NÃO inclui
   * taxas fixas não relacionadas a consumo (ex.: iluminação pública).
   */
  tarifaMediaKwh: number | null;
  cidade: string | null;
  estado: string | null;
  valorTotalFatura: number | null;
  /** true quando a leitura não teve certeza (arquivo ruim, formato incomum etc.). */
  confiancaBaixa: boolean;
  /** Nota curta explicando a leitura ou algum ponto de atenção. */
  observacoes: string;
}

const TAMANHO_MAXIMO_BYTES = 15 * 1024 * 1024; // 15 MB

/** Sempre disponível — a leitura roda local, não depende de nenhum serviço externo configurado. */
export function leituraAutomaticaDisponivel(): boolean {
  return true;
}

export async function lerFaturaAutomaticamente(arquivo: File): Promise<DadosExtraidosFatura> {
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    throw new Error('Arquivo muito grande (máximo 15 MB). Tente uma foto com menos resolução.');
  }

  const ehPdf = arquivo.type === 'application/pdf' || arquivo.name.toLowerCase().endsWith('.pdf');

  const texto = ehPdf ? await extrairTextoDePdf(arquivo) : await extrairTextoDeImagem(arquivo);

  if (!texto || texto.trim().length < 20) {
    throw new Error(
      ehPdf
        ? 'Não consegui ler texto nesse PDF (pode ser uma fatura escaneada como imagem). Tente enviar uma foto em vez do PDF, ou preencha manualmente.'
        : 'Não consegui reconhecer texto nessa foto. Tente uma foto mais nítida e bem iluminada, ou preencha manualmente.'
    );
  }

  return interpretarTextoDaFatura(texto);
}

async function extrairTextoDeImagem(arquivo: File): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('por');
  try {
    const {
      data: { text },
    } = await worker.recognize(arquivo);
    return text;
  } finally {
    await worker.terminate();
  }
}

async function extrairTextoDePdf(arquivo: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;

  const buffer = await arquivo.arrayBuffer();
  const documento = await pdfjsLib.getDocument({ data: buffer }).promise;

  let textoCompleto = '';
  const totalPaginas = Math.min(documento.numPages, 3);
  for (let numeroPagina = 1; numeroPagina <= totalPaginas; numeroPagina++) {
    const pagina = await documento.getPage(numeroPagina);
    const conteudo = await pagina.getTextContent();
    const linha = conteudo.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    textoCompleto += `${linha}\n`;
  }
  return textoCompleto;
}

/**
 * Converte um número no formato brasileiro ("1.234,56" ou "0,4314") para float.
 */
function paraNumeroBr(texto: string): number | null {
  const limpo = texto.trim().replace(/\./g, '').replace(',', '.');
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

function interpretarTextoDaFatura(textoBruto: string): DadosExtraidosFatura {
  const texto = textoBruto.replace(/\s+/g, ' ');
  const observacoesPartes: string[] = [];

  // 1) Consumo em kWh. Faturas variam bastante na ordem: umas mostram
  // "Consumo TE (kWh) 578" (unidade antes do número, formato de tabela),
  // outras "Consumo: 578 kWh" (número antes da unidade). Tenta várias
  // formas, da mais específica pra mais genérica.
  let consumoKwh: number | null = null;
  const padroesConsumo = [
    /consumo[^\d]{0,15}?kwh[^\d]{0,10}?(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/i, // Consumo TE (kWh) 578
    /consumo[^\d]{0,25}?(\d{1,3}(?:\.\d{3})*(?:,\d+)?)\s*kwh/i, // Consumo: 578 kWh
    /kwh[^\d]{0,10}?(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/i, // (kWh) 578, sem a palavra "consumo" por perto
    /(\d{1,4}(?:,\d+)?)\s*kwh/i, // 578 kWh, em qualquer lugar
  ];
  for (const padrao of padroesConsumo) {
    const encontrado = texto.match(padrao);
    if (encontrado) {
      consumoKwh = paraNumeroBr(encontrado[1]);
      if (consumoKwh) break;
    }
  }
  if (!consumoKwh) observacoesPartes.push('não encontrei o consumo em kWh');

  // 2) Tarifa — soma até duas ocorrências de "tarifa ... 0,1234" (TE + TU).
  // Ignora números fora da faixa plausível de tarifa de energia (R$/kWh).
  const valoresTarifa: number[] = [];
  const regexTarifa = /tarifa[^\n]{0,60}?(\d+,\d{2,6})/gi;
  let matchTarifa: RegExpExecArray | null;
  while ((matchTarifa = regexTarifa.exec(texto)) && valoresTarifa.length < 2) {
    const valor = paraNumeroBr(matchTarifa[1]);
    if (valor !== null && valor > 0.05 && valor < 5) {
      valoresTarifa.push(valor);
    }
  }
  const tarifaMediaKwh = valoresTarifa.length > 0 ? Number(valoresTarifa.reduce((a, b) => a + b, 0).toFixed(6)) : null;
  if (!tarifaMediaKwh) observacoesPartes.push('não encontrei a tarifa por kWh');

  // 3) Valor total da fatura.
  let valorTotalFatura: number | null = null;
  const matchTotal = texto.match(/total[^\n\d]{0,25}?r?\$?\s?(\d{1,3}(?:\.\d{3})*,\d{2})/i);
  if (matchTotal) {
    valorTotalFatura = paraNumeroBr(matchTotal[1]);
  }

  // 4) Cidade/UF — deixamos em branco de propósito: são pouco confiáveis de
  // extrair genericamente entre distribuidoras diferentes, e essa
  // informação já é preenchida em outra etapa do formulário.
  const cidade: string | null = null;
  const estado: string | null = null;

  const confiancaBaixa = consumoKwh === null || tarifaMediaKwh === null;

  return {
    consumoKwh,
    tarifaMediaKwh,
    cidade,
    estado,
    valorTotalFatura,
    confiancaBaixa,
    observacoes:
      observacoesPartes.length > 0
        ? `Leitura automática (sem IA): ${observacoesPartes.join('; ')}. Confira e complete manualmente.`
        : 'Leitura automática (sem IA) — confira os valores antes de simular.',
  };
}
