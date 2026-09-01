import { CalendarCheck2, ChevronDown, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TEXTOS_LEGAIS } from '../config/solarConfig';
import { calcularPayback } from '../services/solarCalculator';
import type { ResultadoPayback } from '../types/solar';
import { formatarNumero, parseNumeroBR } from '../utils/currency';
import { FormField } from './ui/FormField';

interface PaybackCardProps {
  economiaAnualEstimada: number;
  onResultadoChange?: (resultado: ResultadoPayback | null) => void;
}

export function PaybackCard({ economiaAnualEstimada, onResultadoChange }: PaybackCardProps) {
  const [aberto, setAberto] = useState(false);
  const [valorTexto, setValorTexto] = useState('18000');

  const valorSistema = parseNumeroBR(valorTexto);
  const resultado = valorSistema > 0 ? calcularPayback({ valorEstimadoSistema: valorSistema }, economiaAnualEstimada) : null;

  useEffect(() => {
    onResultadoChange?.(resultado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorSistema, economiaAnualEstimada]);

  return (
    <div className="animate-fade-up overflow-hidden rounded-3xl border border-black/6 bg-white shadow-soft">
      <button type="button" onClick={() => setAberto((v) => !v)} className="flex w-full items-center justify-between px-5 py-4 sm:px-6">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mist text-brand-teal-600">
            <CalendarCheck2 size={17} />
          </span>
          <span className="text-left">
            <span className="block font-display text-[15.5px] font-bold text-brand-ink">Em quanto tempo o sistema se paga?</span>
            <span className="block text-[12px] text-brand-slate">Payback estimado (opcional)</span>
          </span>
        </span>
        <ChevronDown size={18} className={`shrink-0 text-brand-slate transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="space-y-4 border-t border-black/6 px-5 pb-5 pt-4 sm:px-6">
          <FormField
            label="Valor estimado do sistema"
            icon={<Wallet size={18} />}
            suffix="R$"
            inputMode="decimal"
            placeholder="Ex.: 18.000"
            value={valorTexto}
            onChange={(e) => setValorTexto(e.target.value)}
          />

          {resultado?.paybackAnosEstimado != null ? (
            <div className="flex items-center justify-between rounded-2xl bg-brand-navy-900 px-4 py-3.5 text-white">
              <span className="text-[13px] font-medium text-white/75">Payback estimado</span>
              <span className="font-display text-[20px] font-extrabold">{formatarNumero(resultado.paybackAnosEstimado, 1)} anos</span>
            </div>
          ) : (
            <p className="text-[12.5px] text-brand-slate">Informe um valor de sistema para estimar o payback.</p>
          )}

          <p className="text-[11px] leading-relaxed text-brand-slate">{TEXTOS_LEGAIS.avisoPayback}</p>
        </div>
      )}
    </div>
  );
}
