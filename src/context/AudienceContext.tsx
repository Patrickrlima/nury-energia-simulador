import { createContext, useContext, type ReactNode } from 'react';

/**
 * O mesmo simulador é usado em dois contextos:
 *
 * - "vendedor": ferramenta interna, usada pelo vendedor durante a prospecção/negociação
 *   (rotas em `/`) — mostra histórico ("Minhas simulações"), configurações avançadas e
 *   CTAs pensados para o vendedor enviar a simulação ao cliente.
 * - "site": versão pública, pensada para ser linkada/embutida no site institucional
 *   (rotas em `/simule`) para captar lead orgânico — o próprio visitante preenche os
 *   dados, então os textos e CTAs falam em primeira pessoa e a ferramenta é mais enxuta
 *   (sem histórico, sem configuração técnica avançada).
 *
 * As telas (Home, Simulator, Result) são as mesmas — só o texto/CTA muda conforme a audiência.
 */
export type Audiencia = 'vendedor' | 'site';

interface AudienceContextValue {
  audiencia: Audiencia;
  /** Prefixo de rota: '' para o app do vendedor, '/simule' para a versão pública. */
  basePath: string;
}

const AudienceContext = createContext<AudienceContextValue>({ audiencia: 'vendedor', basePath: '' });

export function AudienceProvider({ audiencia, children }: { audiencia: Audiencia; children: ReactNode }) {
  const basePath = audiencia === 'site' ? '/simule' : '';
  return <AudienceContext.Provider value={{ audiencia, basePath }}>{children}</AudienceContext.Provider>;
}

export function useAudience(): AudienceContextValue {
  return useContext(AudienceContext);
}
