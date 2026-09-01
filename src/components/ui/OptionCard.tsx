import type { LucideIcon } from 'lucide-react';

interface OptionCardProps {
  icon: LucideIcon;
  label: string;
  selecionado: boolean;
  onClick: () => void;
}

export function OptionCard({ icon: Icon, label, selecionado, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selecionado}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center transition active:scale-[0.97] ${
        selecionado
          ? 'border-brand-teal-500 bg-brand-teal-500/10 shadow-glow-teal'
          : 'border-black/8 bg-white hover:border-brand-teal-500/40'
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
          selecionado ? 'bg-brand-teal-500 text-white' : 'bg-brand-mist text-brand-navy-700'
        }`}
      >
        <Icon size={20} />
      </span>
      <span className={`text-[13px] font-semibold ${selecionado ? 'text-brand-navy-900' : 'text-brand-slate'}`}>{label}</span>
    </button>
  );
}
