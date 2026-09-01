import { ArrowDown } from 'lucide-react';
import type { ResultadoSimulacao } from '../types/solar';
import { formatarMoeda } from '../utils/currency';

interface EconomyChartProps {
  resultado: ResultadoSimulacao;
}

export function EconomyChart({ resultado }: EconomyChartProps) {
  const { valorContaAtual, contaEstimadaComSolar, economiaMensalEstimada } = resultado;
  const max = Math.max(valorContaAtual, 1);
  const pctAtual = 100;
  const pctSolar = Math.max((contaEstimadaComSolar / max) * 100, 4);

  return (
    <div className="animate-fade-up rounded-3xl border border-black/6 bg-white p-5 shadow-soft sm:p-6">
      <h3 className="font-display text-[16.5px] font-bold text-brand-ink">Sua conta: antes e depois</h3>
      <p className="mt-0.5 text-[13px] text-brand-slate">Comparativo visual simples para mostrar ao cliente.</p>

      <div className="mt-5 space-y-4">
        <BarRow rotulo="Conta atual" valor={valorContaAtual} percentual={pctAtual} cor="bg-brand-navy-800" />
        <BarRow rotulo="Conta estimada com solar" valor={contaEstimadaComSolar} percentual={pctSolar} cor="bg-gradient-to-r from-brand-teal-500 to-brand-sun-400" delayMs={180} />
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-sun-400/12 px-4 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-sun-400 text-brand-navy-900">
          <ArrowDown size={17} />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-brand-navy-800">Economia mensal estimada</p>
          <p className="font-display text-[19px] font-extrabold text-brand-navy-900">{formatarMoeda(economiaMensalEstimada)}</p>
        </div>
      </div>
    </div>
  );
}

function BarRow({
  rotulo,
  valor,
  percentual,
  cor,
  delayMs = 0,
}: {
  rotulo: string;
  valor: number;
  percentual: number;
  cor: string;
  delayMs?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-brand-slate">{rotulo}</span>
        <span className="font-display text-[15px] font-bold text-brand-ink">{formatarMoeda(valor)}</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-brand-mist">
        <div
          className={`bar-grow origin-left h-full rounded-full ${cor}`}
          style={{ width: `${percentual}%`, animationDelay: `${delayMs}ms` }}
        />
      </div>
    </div>
  );
}
