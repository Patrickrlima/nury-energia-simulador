import { CalendarClock, TrendingUp, Wallet } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import type { ResultadoSimulacao } from '../types/solar';
import { formatarMoeda } from '../utils/currency';

interface SavingsCardProps {
  resultado: ResultadoSimulacao;
}

export function SavingsCard({ resultado }: SavingsCardProps) {
  const economiaMensal = useCountUp(resultado.economiaMensalEstimada, 950, 60);
  const economiaAnual = useCountUp(resultado.economiaAnualEstimada, 1050, 220);
  const percentual = useCountUp(resultado.percentualEconomiaEstimado, 900, 340);

  return (
    <div className="animate-fade-up overflow-hidden rounded-3xl bg-gradient-to-br from-brand-teal-600 via-brand-teal-500 to-brand-navy-700 p-5 text-white shadow-lift sm:p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
          <Wallet size={13} />
          Economia estimada
        </span>
        <span className="flex items-center gap-1 rounded-full bg-brand-sun-400/95 px-2.5 py-1 text-[11.5px] font-extrabold text-brand-navy-900">
          <TrendingUp size={13} />
          -{formatarNumero(percentual)}% na conta
        </span>
      </div>

      <p className="mt-4 text-[13.5px] font-medium text-white/75">Economia mensal estimada</p>
      <p className="font-display text-[38px] font-extrabold leading-none sm:text-[44px]">{formatarMoeda(economiaMensal)}</p>

      <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <CalendarClock size={17} className="text-brand-sun-300" />
        </span>
        <div>
          <p className="text-[12px] font-medium text-white/70">Economia anual estimada</p>
          <p className="font-display text-[19px] font-bold">{formatarMoeda(economiaAnual)}</p>
        </div>
      </div>
    </div>
  );
}

function formatarNumero(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}
