/** Funções matemáticas puras e reutilizáveis (arredondamento, projeções, financiamento). */

export function arredondarParaCima(valor: number): number {
  return Math.ceil(valor);
}

export function clamp(valor: number, min: number, max: number): number {
  return Math.min(Math.max(valor, min), max);
}

/** Projeta a economia acumulada (simples, sem inflação de tarifa) para uma lista de anos. */
export function projetarEconomiaAcumulada(economiaAnual: number, listaDeAnos: number[]) {
  return listaDeAnos.map((anos) => ({
    anos,
    valorAcumulado: economiaAnual * anos,
  }));
}

/** Payback simples: investimento / economia anual. Retorna null se não for calculável. */
export function calcularPaybackAnos(valorInvestimento: number, economiaAnual: number): number | null {
  if (valorInvestimento <= 0 || economiaAnual <= 0) return null;
  return valorInvestimento / economiaAnual;
}

/**
 * Cálculo de parcela pelo sistema de amortização Price (parcelas fixas).
 * i = taxa de juros mensal em decimal (ex.: 0.018 para 1,8% a.m.)
 */
export function calcularParcelaPrice(valorFinanciado: number, taxaJurosMensalPct: number, numeroParcelas: number): number {
  if (valorFinanciado <= 0 || numeroParcelas <= 0) return 0;
  const i = taxaJurosMensalPct / 100;
  if (i === 0) return valorFinanciado / numeroParcelas;
  const fator = Math.pow(1 + i, numeroParcelas);
  return (valorFinanciado * i * fator) / (fator - 1);
}
