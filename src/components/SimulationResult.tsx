import { Share2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TEXTOS_LEGAIS } from '../config/solarConfig';
import { useAudience } from '../context/AudienceContext';
import { atualizarStatusSimulacao } from '../services/historyService';
import type { ResultadoPayback, ResultadoSimulacao } from '../types/solar';
import { AccumulatedSavings } from './AccumulatedSavings';
import { EconomyChart } from './EconomyChart';
import { PaybackCard } from './PaybackCard';
import { PdfGenerator } from './PdfGenerator';
import { ShareSheet } from './ShareSheet';
import { SolarSystemCard } from './SolarSystemCard';
import { SavingsCard } from './SavingsCard';
import { WhatsAppButton } from './WhatsAppButton';

interface SimulationResultProps {
  resultado: ResultadoSimulacao;
  registroId?: string | null;
}

export function SimulationResult({ resultado, registroId }: SimulationResultProps) {
  const [payback, setPayback] = useState<ResultadoPayback | null>(null);
  const [shareAberto, setShareAberto] = useState(false);
  const { audiencia } = useAudience();
  const ehPublico = audiencia === 'site';

  const primeiroNome = resultado.parametros.cliente.nome.trim().split(' ')[0];
  const codigoCompartilhavel = useMemo(() => (registroId ? registroId.slice(-6).toUpperCase() : Math.random().toString(36).slice(2, 8).toUpperCase()), [registroId]);

  function marcarPropostaEnviada() {
    if (registroId) atualizarStatusSimulacao(registroId, 'proposta_enviada');
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-5 pb-16 pt-6 sm:px-8">
      <header className="animate-fade-up text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-sun-400/15 px-3 py-1 text-[12px] font-bold uppercase tracking-wide text-brand-sun-600">
          <Sparkles size={13} />
          Estimativa de dimensionamento
        </span>
        <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight text-brand-ink sm:text-[30px]">Seu potencial de economia</h1>
        {primeiroNome && <p className="mt-1.5 text-[14.5px] text-brand-slate">Simulação preparada para {primeiroNome}</p>}
      </header>

      <SolarSystemCard resultado={resultado} />
      <SavingsCard resultado={resultado} />
      <EconomyChart resultado={resultado} />
      <AccumulatedSavings resultado={resultado} />
      <PaybackCard economiaAnualEstimada={resultado.economiaAnualEstimada} onResultadoChange={setPayback} />

      {/* CTA comercial */}
      <div className="animate-fade-up rounded-3xl bg-gradient-to-br from-brand-navy-900 to-brand-navy-700 p-5 text-center text-white shadow-lift sm:p-7">
        <h3 className="font-display text-[19px] font-extrabold sm:text-[21px]">Gostou do resultado?</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] text-white/75">
          {ehPublico
            ? 'Fale com a Nury Energia agora e receba uma proposta completa, personalizada para o seu imóvel.'
            : 'Agora podemos fazer uma análise completa do seu imóvel e preparar uma proposta sob medida.'}
        </p>

        <div className="mt-5 space-y-2.5">
          {ehPublico ? (
            <>
              <WhatsAppButton resultado={resultado} perspectiva="autoatendimento">
                QUERO UMA PROPOSTA
              </WhatsAppButton>
              <WhatsAppButton resultado={resultado} perspectiva="autoatendimento" variante="contorno">
                FALAR COM UM CONSULTOR
              </WhatsAppButton>
            </>
          ) : (
            <>
              <WhatsAppButton resultado={resultado} destino="cliente" onClick={marcarPropostaEnviada}>
                QUERO UMA PROPOSTA
              </WhatsAppButton>
              <WhatsAppButton resultado={resultado} destino="consultor" variante="contorno">
                FALAR COM UM CONSULTOR
              </WhatsAppButton>
            </>
          )}
        </div>
      </div>

      {/* Envio direto + compartilhamento — só no app do vendedor; o simulador público fica só com as duas chamadas de WhatsApp acima */}
      {!ehPublico && (
        <div className="animate-fade-up space-y-2.5">
          <WhatsAppButton resultado={resultado} destino="cliente" onClick={marcarPropostaEnviada}>
            ENVIAR SIMULAÇÃO PELO WHATSAPP
          </WhatsAppButton>

          <div className="grid grid-cols-2 gap-2.5">
            <PdfGenerator resultado={resultado} payback={payback} />
            <button
              type="button"
              onClick={() => setShareAberto(true)}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand-teal-500/25 bg-white px-4 text-[14px] font-bold text-brand-teal-700 transition active:scale-[0.98]"
            >
              <Share2 size={17} />
              COMPARTILHAR
            </button>
          </div>
        </div>
      )}

      <p className="animate-fade-up text-center text-[11.5px] leading-relaxed text-brand-slate">
        {TEXTOS_LEGAIS.avisoResultado} {TEXTOS_LEGAIS.avisoGeral}
      </p>

      {!ehPublico && (
        <ShareSheet aberto={shareAberto} onFechar={() => setShareAberto(false)} resultado={resultado} payback={payback} codigoCompartilhavel={codigoCompartilhavel} />
      )}
    </div>
  );
}
