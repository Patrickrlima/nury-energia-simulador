import { HSP_PADRAO_NACIONAL, INDICE_SOLAR_POR_CIDADE, TARIFA_PADRAO_KWH } from '../config/solarConfig';
import type { IndiceSolarCidade } from '../types/solar';

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Busca o índice de geração solar (Horas de Sol Pleno) para a cidade informada.
 *
 * Hoje consulta uma tabela estática local (`solarConfig.ts`). O ponto de
 * integração fica isolado aqui: futuramente esta função pode passar a
 * consultar uma API/banco de dados de irradiância (ex.: CRESESB) mantendo a
 * mesma assinatura, sem exigir mudanças no restante do app.
 */
export function buscarIndiceSolarPorCidade(
  cidade: string,
  estado: string
): { horasDeSolPleno: number; origem: 'cidade' | 'padraoNacional' } {
  const cidadeNormalizada = normalizar(cidade);
  const estadoNormalizado = normalizar(estado);

  const encontrada = INDICE_SOLAR_POR_CIDADE.find(
    (item: IndiceSolarCidade) =>
      normalizar(item.cidade) === cidadeNormalizada && normalizar(item.estado) === estadoNormalizado
  );

  if (encontrada) {
    return { horasDeSolPleno: encontrada.horasDeSolPleno, origem: 'cidade' };
  }

  return { horasDeSolPleno: HSP_PADRAO_NACIONAL, origem: 'padraoNacional' };
}

/** Estima o consumo mensal (kWh) a partir do valor da conta, usando a tarifa configurada. */
export function estimarConsumoPorValorConta(
  valorConta: number,
  tarifaPorKwh: number = TARIFA_PADRAO_KWH
): number {
  if (valorConta <= 0 || tarifaPorKwh <= 0) return 0;
  return valorConta / tarifaPorKwh;
}

/** Estima o valor da conta a partir do consumo mensal (kWh), usando a tarifa configurada. */
export function estimarValorContaPorConsumo(
  consumoKwh: number,
  tarifaPorKwh: number = TARIFA_PADRAO_KWH
): number {
  if (consumoKwh <= 0) return 0;
  return consumoKwh * tarifaPorKwh;
}
