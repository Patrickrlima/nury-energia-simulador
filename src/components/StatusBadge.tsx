import type { StatusSimulacao } from '../types/client';
import { STATUS_LABELS } from '../types/client';

const STATUS_STYLES: Record<StatusSimulacao, string> = {
  simulacao: 'bg-brand-mist text-brand-slate',
  proposta_enviada: 'bg-brand-teal-500/12 text-brand-teal-700',
  em_negociacao: 'bg-brand-sun-400/18 text-brand-sun-600',
  vendido: 'bg-emerald-500/12 text-emerald-700',
  perdido: 'bg-rose-500/10 text-rose-600',
};

export function StatusBadge({ status }: { status: StatusSimulacao }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
