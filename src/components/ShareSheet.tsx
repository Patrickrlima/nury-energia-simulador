import { Check, Copy, FileDown, Link2, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { EMPRESA } from '../config/solarConfig';
import { useAudience } from '../context/AudienceContext';
import { gerarPdfSimulacao } from '../services/pdfService';
import { abrirWhatsapp, abrirWhatsappAutoatendimento } from '../services/whatsappService';
import type { ResultadoPayback, ResultadoSimulacao } from '../types/solar';

interface ShareSheetProps {
  aberto: boolean;
  onFechar: () => void;
  resultado: ResultadoSimulacao;
  payback?: ResultadoPayback | null;
  codigoCompartilhavel: string;
}

/**
 * Compartilhamento da simulação. O link compartilhável é uma prévia local
 * (não persiste em servidor ainda) — estrutura pronta para, futuramente,
 * apontar para `nuryenergia.com.br/simulacao/<codigo>` real.
 */
export function ShareSheet({ aberto, onFechar, resultado, payback, codigoCompartilhavel }: ShareSheetProps) {
  const [copiado, setCopiado] = useState(false);
  const { audiencia } = useAudience();
  const ehPublico = audiencia === 'site';
  if (!aberto) return null;

  const linkPrevia = `${EMPRESA.site}/simulacao/${codigoCompartilhavel}`;

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(`https://${linkPrevia}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // clipboard indisponível — usuário pode copiar manualmente
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-navy-950/50 backdrop-blur-sm sm:items-center" onClick={onFechar}>
      <div
        className="animate-fade-up w-full max-w-md rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[17px] font-bold text-brand-ink">Compartilhar simulação</h3>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-mist text-brand-slate">
            <X size={17} />
          </button>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => (ehPublico ? abrirWhatsappAutoatendimento(resultado) : abrirWhatsapp(resultado, 'cliente'))}
            className="flex w-full items-center gap-3 rounded-2xl border border-black/6 px-4 py-3.5 text-left transition active:scale-[0.98]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-whats/12 text-brand-whats-dark">
              <MessageCircle size={18} />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-brand-ink">{ehPublico ? 'Falar com a Nury' : 'Enviar pelo WhatsApp'}</span>
              <span className="block text-[12px] text-brand-slate">{ehPublico ? 'Peça sua proposta pelo WhatsApp' : 'Mensagem pronta para o cliente'}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => gerarPdfSimulacao(resultado, payback)}
            className="flex w-full items-center gap-3 rounded-2xl border border-black/6 px-4 py-3.5 text-left transition active:scale-[0.98]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy-900/8 text-brand-navy-900">
              <FileDown size={18} />
            </span>
            <span>
              <span className="block text-[14px] font-semibold text-brand-ink">Baixar PDF</span>
              <span className="block text-[12px] text-brand-slate">Proposta comercial em PDF</span>
            </span>
          </button>

          <div className="rounded-2xl border border-black/6 px-4 py-3.5">
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal-500/12 text-brand-teal-600">
                <Link2 size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-brand-ink">Link compartilhável</span>
                <span className="block truncate text-[12px] text-brand-slate">{linkPrevia}</span>
              </span>
              <button
                type="button"
                onClick={copiarLink}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand-mist px-3 text-[12px] font-semibold text-brand-navy-800"
              >
                {copiado ? <Check size={14} className="text-brand-teal-600" /> : <Copy size={14} />}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </span>
            <p className="mt-2 text-[11px] leading-relaxed text-brand-slate">
              Prévia de funcionalidade futura — em breve o cliente poderá abrir a simulação direto pelo link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
