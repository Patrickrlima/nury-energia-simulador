const formatadorBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatadorBRLCompacto = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function formatarMoeda(valor: number): string {
  if (!Number.isFinite(valor)) return formatadorBRL.format(0);
  return formatadorBRL.format(valor);
}

/** Formata sem casas decimais — bom para números grandes em cards. */
export function formatarMoedaCompacta(valor: number): string {
  if (!Number.isFinite(valor)) return formatadorBRLCompacto.format(0);
  return formatadorBRLCompacto.format(valor);
}

export function formatarNumero(valor: number, casasDecimais = 0): string {
  if (!Number.isFinite(valor)) return '0';
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  });
}

/** Converte "1.234,56" ou "1234,56" ou "1234.56" digitado pelo usuário em number. */
export function parseNumeroBR(valor: string): number {
  if (!valor) return 0;
  const limpo = valor
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const numero = parseFloat(limpo);
  return Number.isFinite(numero) ? numero : 0;
}
