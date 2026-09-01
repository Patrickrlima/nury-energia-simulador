import type { IndiceSolarCidade, PotenciaModuloWp } from '../types/solar';

/**
 * Configuração central do simulador solar.
 *
 * Objetivo: nenhum "número mágico" deve viver espalhado dentro de componentes
 * ou do motor de cálculo. Tudo que é uma premissa comercial/técnica ajustável
 * fica aqui, para que possa evoluir (ex.: plugar uma API de irradiância real,
 * mudar a tarifa padrão, liberar novos módulos) sem tocar em UI ou cálculo.
 */

export const EMPRESA = {
  nome: 'Nury Energia',
  slogan: 'Energia solar que cabe no seu bolso',
  telefoneComercial: '5551999999999', // formato WhatsApp: 55 + DDD + número (ajustar para o real)
  site: 'nuryenergia.com.br',
  cidadeSede: 'Osório',
  estadoSede: 'RS',
};

/** Módulos fotovoltaicos disponíveis para seleção no simulador. */
export const MODULOS_DISPONIVEIS: PotenciaModuloWp[] = [450, 500, 550, 580, 600];

/** Módulo padrão ao abrir o simulador. */
export const POTENCIA_MODULO_PADRAO: PotenciaModuloWp = 550;

/** Tarifa padrão (R$/kWh) usada quando o vendedor só informa o valor da conta. */
export const TARIFA_PADRAO_KWH = 0.98;

/**
 * Perdas do sistema (cabeamento, inversor, temperatura, sujeira, sombreamento leve etc.),
 * representadas como fator de performance. 0.80 = 80% de aproveitamento da geração teórica.
 */
export const FATOR_PERFORMANCE_SISTEMA = 0.8;

/** Horas de Sol Pleno (HSP) médias nacionais, usadas quando a cidade não está no índice local. */
export const HSP_PADRAO_NACIONAL = 4.6;

/**
 * Índice de geração solar por cidade (Horas de Sol Pleno médias/dia).
 * Estrutura preparada para, futuramente, ser substituída por consulta a uma
 * API/banco de dados de irradiância solar (ex.: CRESESB/INPE) sem alterar o
 * restante do motor de cálculo — basta trocar a implementação de
 * `buscarIndiceSolarPorCidade` em solarUtils.ts.
 */
export const INDICE_SOLAR_POR_CIDADE: IndiceSolarCidade[] = [
  { cidade: 'Osório', estado: 'RS', horasDeSolPleno: 4.8 },
  { cidade: 'Porto Alegre', estado: 'RS', horasDeSolPleno: 4.7 },
  { cidade: 'Caxias do Sul', estado: 'RS', horasDeSolPleno: 4.5 },
  { cidade: 'São Paulo', estado: 'SP', horasDeSolPleno: 4.4 },
  { cidade: 'Campinas', estado: 'SP', horasDeSolPleno: 4.9 },
  { cidade: 'Rio de Janeiro', estado: 'RJ', horasDeSolPleno: 4.6 },
  { cidade: 'Belo Horizonte', estado: 'MG', horasDeSolPleno: 5.1 },
  { cidade: 'Brasília', estado: 'DF', horasDeSolPleno: 5.5 },
  { cidade: 'Salvador', estado: 'BA', horasDeSolPleno: 5.3 },
  { cidade: 'Fortaleza', estado: 'CE', horasDeSolPleno: 5.6 },
  { cidade: 'Recife', estado: 'PE', horasDeSolPleno: 5.4 },
  { cidade: 'Curitiba', estado: 'PR', horasDeSolPleno: 4.3 },
  { cidade: 'Florianópolis', estado: 'SC', horasDeSolPleno: 4.4 },
  { cidade: 'Goiânia', estado: 'GO', horasDeSolPleno: 5.4 },
  { cidade: 'Campo Grande', estado: 'MS', horasDeSolPleno: 5.0 },
  { cidade: 'Natal', estado: 'RN', horasDeSolPleno: 5.7 },
  { cidade: 'Manaus', estado: 'AM', horasDeSolPleno: 4.5 },
];

/**
 * Percentual mínimo da conta atual que permanece após a instalação
 * (ex.: custo de disponibilidade / taxa mínima da concessionária e eventual
 * consumo não compensável). Usado apenas como piso conservador da estimativa.
 */
export const PERCENTUAL_MINIMO_CONTA_RESTANTE = 0.12;

/** Anos exibidos na projeção de economia acumulada. */
export const ANOS_PROJECAO_ACUMULADA = [1, 5, 10, 15, 20, 25];

/** Premissas padrão para a simulação de financiamento (seção modular/futura). */
export const FINANCIAMENTO_PADRAO = {
  numeroParcelas: 60,
  taxaJurosMensal: 1.8, // % ao mês
};

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const TEXTOS_LEGAIS = {
  avisoResultado:
    'Simulação preliminar. O dimensionamento definitivo depende da análise técnica da instalação, fatura de energia, localização, orientação do telhado, sombreamento e demais condições do imóvel.',
  avisoAcumulado:
    'Estimativa baseada nos valores informados. Não considera alterações futuras de tarifas, manutenção, financiamento ou outros fatores.',
  avisoGeral:
    'Os resultados apresentados são estimativas comerciais e podem variar conforme condições técnicas, localização, orientação e inclinação do telhado, sombreamento, equipamentos utilizados, tarifas e demais características da instalação.',
  avisoPayback: 'Payback estimado. Não constitui garantia de retorno financeiro.',
  avisoPdf: 'Esta simulação possui caráter preliminar e comercial. O dimensionamento definitivo depende de análise técnica.',
};
