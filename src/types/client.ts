import type { ResultadoSimulacao, TipoInstalacao } from './solar';

export type StatusSimulacao =
  | 'simulacao'
  | 'proposta_enviada'
  | 'em_negociacao'
  | 'vendido'
  | 'perdido';

export const STATUS_LABELS: Record<StatusSimulacao, string> = {
  simulacao: 'Simulação',
  proposta_enviada: 'Proposta enviada',
  em_negociacao: 'Em negociação',
  vendido: 'Vendido',
  perdido: 'Perdido',
};

/** De onde veio o lead: o vendedor simulou com o cliente, ou o próprio visitante simulou no site. */
export type OrigemSimulacao = 'vendedor' | 'site';

export const ORIGEM_LABELS: Record<OrigemSimulacao, string> = {
  vendedor: 'Vendedor',
  site: 'Site',
};

/** Registro salvo no histórico local ("Minhas simulações") — reúne simulações feitas por vendedores e leads vindos do site. */
export interface RegistroSimulacao {
  id: string;
  criadoEm: string; // ISO date
  origem: OrigemSimulacao;
  nomeCliente: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  tipoInstalacao: TipoInstalacao;
  consumoMensalKwh: number;
  potenciaTotalInstaladaKwp: number;
  numeroDeModulos: number;
  economiaMensalEstimada: number;
  economiaAnualEstimada: number;
  status: StatusSimulacao;
  resultado: ResultadoSimulacao;
}
