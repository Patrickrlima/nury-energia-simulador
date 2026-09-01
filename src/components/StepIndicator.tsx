interface StepIndicatorProps {
  etapaAtual: number;
  totalEtapas: number;
  rotulos: string[];
}

export function StepIndicator({ etapaAtual, totalEtapas, rotulos }: StepIndicatorProps) {
  return (
    <div className="mx-auto w-full max-w-md px-1">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalEtapas }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= etapaAtual ? 'bg-gradient-to-r from-brand-teal-500 to-brand-sun-400' : 'bg-black/8'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-[12.5px] font-semibold uppercase tracking-wide text-brand-slate">
        Etapa {etapaAtual + 1} de {totalEtapas} · {rotulos[etapaAtual]}
      </p>
    </div>
  );
}
