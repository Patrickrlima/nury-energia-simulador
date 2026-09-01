/**
 * Tipos relacionados ao motor de simulação solar.
 * Mantidos isolados da UI para que o cálculo possa evoluir
 * (nova fonte de irradiância, novos módulos, etc.) sem tocar em componentes.
 */

export type TipoInstalacao = 'residencial' | 'comercial' | 'rural' | 'industrial';

export type FormaEntradaConsumo = 'consumo' | 'valorConta';

/** Potências de módulo fotovoltaico suportadas hoje (Wp). */
export type PotenciaModuloWp = 450 | 500 | 550 | 580 | 600;

export interface DadosClienteSimulacao {
  nome: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  tipoInstalacao: TipoInstalacao;
}

export interface DadosContaEnergia {
  formaEntrada: FormaEntradaConsumo;
  /** kWh/mês, quando informado diretamente. */
  consumoMensalKwh?: number;
  /** R$/mês, quando o vendedor só tem o valor da conta. */
  valorContaMensal?: number;
  /** true quando o vendedor marcou "não sei meu consumo em kWh". */
  naoSeiConsumo?: boolean;
}

export interface ParametrosSimulacao {
  cliente: DadosClienteSimulacao;
  conta: DadosContaEnergia;
  potenciaModuloWp: PotenciaModuloWp;
}

export interface EconomiaAcumuladaPonto {
  anos: number;
  valorAcumulado: number;
}

export interface ResultadoSimulacao {
  /** Ecoado de volta para facilitar exibição sem precisar re-buscar o input. */
  parametros: ParametrosSimulacao;

  consumoMensalEstimadoKwh: number;
  consumoAnualEstimadoKwh: number;
  tarifaUtilizada: number;
  valorContaAtual: number;

  horasDeSolPleno: number;
  origemIndiceSolar: 'cidade' | 'padraoNacional';

  potenciaModuloWp: number;
  numeroDeModulos: number;
  potenciaTotalInstaladaKwp: number;

  geracaoMensalEstimadaKwh: number;
  geracaoAnualEstimadaKwh: number;

  contaEstimadaComSolar: number;
  economiaMensalEstimada: number;
  economiaAnualEstimada: number;
  percentualEconomiaEstimado: number;

  economiaAcumulada: EconomiaAcumuladaPonto[];
}

export interface ParametrosPayback {
  valorEstimadoSistema: number;
}

export interface ResultadoPayback {
  valorEstimadoSistema: number;
  economiaAnualEstimada: number;
  paybackAnosEstimado: number | null;
}

export interface ParametrosFinanciamento {
  valorSistema: number;
  valorEntrada: number;
  numeroParcelas: number;
  taxaJurosMensal: number; // em % (ex.: 1.8)
}

export interface ResultadoFinanciamento {
  valorFinanciado: number;
  parcelaEstimada: number;
  economiaMensalEstimada: number;
  diferencaMensal: number;
}

export interface IndiceSolarCidade {
  cidade: string;
  estado: string;
  horasDeSolPleno: number;
}
