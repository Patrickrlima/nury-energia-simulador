import {
  ANOS_PROJECAO_ACUMULADA,
  FATOR_PERFORMANCE_SISTEMA,
  PERCENTUAL_MINIMO_CONTA_RESTANTE,
  TARIFA_PADRAO_KWH,
} from '../config/solarConfig';
import type {
  ParametrosFinanciamento,
  ParametrosPayback,
  ParametrosSimulacao,
  ResultadoFinanciamento,
  ResultadoPayback,
  ResultadoSimulacao,
} from '../types/solar';
import { calcularParcelaPrice, calcularPaybackAnos, projetarEconomiaAcumulada } from '../utils/calculations';
import { buscarIndiceSolarPorCidade, estimarConsumoPorValorConta, estimarValorContaPorConsumo } from '../utils/solarUtils';

const DIAS_MES = 30;

/**
 * Motor de cálculo do simulador solar.
 *
 * Toda a matemática comercial fica concentrada aqui — nenhum componente de UI
 * deve fazer contas de dimensionamento diretamente. Isso garante que o
 * simulador inteiro (Home, formulário, resultado, PDF, WhatsApp) fale sempre
 * a mesma "verdade" numérica.
 *
 * IMPORTANTE: este é um motor de ESTIMATIVA COMERCIAL, não um projeto técnico.
 * O dimensionamento definitivo depende de análise técnica real da instalação.
 */
export function calcularSimulacao(parametros: ParametrosSimulacao): ResultadoSimulacao {
  const { cliente, conta, potenciaModuloWp } = parametros;

  const tarifaUtilizada = TARIFA_PADRAO_KWH;

  // 1) Normaliza consumo e valor da conta, seja qual for a forma de entrada.
  let consumoMensalEstimadoKwh: number;
  let valorContaAtual: number;

  if (conta.formaEntrada === 'consumo' && conta.consumoMensalKwh) {
    consumoMensalEstimadoKwh = conta.consumoMensalKwh;
    valorContaAtual = estimarValorContaPorConsumo(conta.consumoMensalKwh, tarifaUtilizada);
  } else {
    valorContaAtual = conta.valorContaMensal ?? 0;
    consumoMensalEstimadoKwh = estimarConsumoPorValorConta(valorContaAtual, tarifaUtilizada);
  }

  const consumoAnualEstimadoKwh = consumoMensalEstimadoKwh * 12;

  // 2) Índice solar da cidade (preparado para futura integração externa).
  const { horasDeSolPleno, origem } = buscarIndiceSolarPorCidade(cliente.cidade, cliente.estado);

  // 3) Dimensionamento estimado do sistema.
  const geracaoNecessariaPorKwpDiaria = horasDeSolPleno * FATOR_PERFORMANCE_SISTEMA;
  const geracaoMensalPorKwp = geracaoNecessariaPorKwpDiaria * DIAS_MES;

  const potenciaNecessariaKwp = geracaoMensalPorKwp > 0 ? consumoMensalEstimadoKwh / geracaoMensalPorKwp : 0;

  const numeroDeModulos = potenciaNecessariaKwp > 0 ? Math.max(1, Math.ceil((potenciaNecessariaKwp * 1000) / potenciaModuloWp)) : 0;

  const potenciaTotalInstaladaKwp = (numeroDeModulos * potenciaModuloWp) / 1000;

  // 4) Geração estimada com a potência realmente instalada (em módulos inteiros).
  const geracaoMensalEstimadaKwh = potenciaTotalInstaladaKwp * geracaoMensalPorKwp;
  const geracaoAnualEstimadaKwh = geracaoMensalEstimadaKwh * 12;

  // 5) Economia: energia gerada compensa a conta, respeitando um piso mínimo
  // (taxa de disponibilidade / consumo não compensável).
  const economiaBrutaMensal = Math.min(geracaoMensalEstimadaKwh, consumoMensalEstimadoKwh) * tarifaUtilizada;
  const pisoContaMinima = valorContaAtual * PERCENTUAL_MINIMO_CONTA_RESTANTE;
  const contaEstimadaComSolar = Math.max(valorContaAtual - economiaBrutaMensal, pisoContaMinima);
  const economiaMensalEstimada = Math.max(valorContaAtual - contaEstimadaComSolar, 0);
  const economiaAnualEstimada = economiaMensalEstimada * 12;
  const percentualEconomiaEstimado = valorContaAtual > 0 ? (economiaMensalEstimada / valorContaAtual) * 100 : 0;

  const economiaAcumulada = projetarEconomiaAcumulada(economiaAnualEstimada, ANOS_PROJECAO_ACUMULADA);

  return {
    parametros,
    consumoMensalEstimadoKwh,
    consumoAnualEstimadoKwh,
    tarifaUtilizada,
    valorContaAtual,
    horasDeSolPleno,
    origemIndiceSolar: origem,
    potenciaModuloWp,
    numeroDeModulos,
    potenciaTotalInstaladaKwp,
    geracaoMensalEstimadaKwh,
    geracaoAnualEstimadaKwh,
    contaEstimadaComSolar,
    economiaMensalEstimada,
    economiaAnualEstimada,
    percentualEconomiaEstimado,
    economiaAcumulada,
  };
}

export function calcularPayback(params: ParametrosPayback, economiaAnualEstimada: number): ResultadoPayback {
  return {
    valorEstimadoSistema: params.valorEstimadoSistema,
    economiaAnualEstimada,
    paybackAnosEstimado: calcularPaybackAnos(params.valorEstimadoSistema, economiaAnualEstimada),
  };
}

export function calcularFinanciamento(
  params: ParametrosFinanciamento,
  economiaMensalEstimada: number
): ResultadoFinanciamento {
  const valorFinanciado = Math.max(params.valorSistema - params.valorEntrada, 0);
  const parcelaEstimada = calcularParcelaPrice(valorFinanciado, params.taxaJurosMensal, params.numeroParcelas);

  return {
    valorFinanciado,
    parcelaEstimada,
    economiaMensalEstimada,
    diferencaMensal: parcelaEstimada - economiaMensalEstimada,
  };
}
