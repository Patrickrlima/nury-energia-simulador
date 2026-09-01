import { PiggyBank } from 'lucide-react';
import { TEXTOS_LEGAIS } from '../config/solarConfig';
import type { ResultadoSimulacao } from '../types/solar';
import { formatarMoeda, formatarMoedaCompacta } from '../utils/currency';

interface AccumulatedSavingsProps {
  resultado: ResultadoSimulacao;
}

export function AccumulatedSavings({ resultado }: AccumulatedSavingsProps) {
  const pontos = resultado.economiaAcumulada;
  const ultimo = pontos[pontos.length - 1];

  return (
    <div className="animate-fade-up rounded-3xl border border-black/6 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist text-brand-teal-600">
          <PiggyBank size={16} />
        </span>
        <h3 className="font-display text-[16.5px] font-bold text-brand-ink">Imagine essa economia ao longo dos anos</h3>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {pontos.map((ponto) => {
          const destaque = ponto.anos === ultimo.anos;
          return (
            <div
              key={ponto.anos}
              className={`rounded-2xl px-2 py-3 text-center ${
                destaque ? 'bg-gradient-to-br from-brand-navy-900 to-brand-teal-600 text-white' : 'bg-brand-mist text-brand-ink'
              }`}
            >
              <p className={`text-[11px] font-semibold ${destaque ? 'text-white/75' : 'text-brand-slate'}`}>{ponto.anos} ano{ponto.anos > 1 ? 's' : ''}</p>
              <p className="mt-1 font-display text-[13px] font-bold leading-tight sm:text-[14px]">{formatarMoedaCompacta(ponto.valorAcumulado)}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-brand-sun-400/12 px-4 py-3">
        <p className="text-[12.5px] font-semibold text-brand-navy-800">
          Em {ultimo.anos} anos, a economia pode chegar a{' '}
          <span className="font-display text-[15px] font-extrabold text-brand-navy-900">{formatarMoeda(ultimo.valorAcumulado)}</span>
        </p>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-brand-slate">{TEXTOS_LEGAIS.avisoAcumulado}</p>
    </div>
  );
}
