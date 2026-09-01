import { Loader2, Sparkles, SunMedium, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const ETAPAS = [
  { texto: 'Analisando seu consumo...', icon: Zap },
  { texto: 'Calculando potencial de geração...', icon: SunMedium },
  { texto: 'Preparando sua estimativa...', icon: Sparkles },
];

interface CalculatingOverlayProps {
  onFinalizar: () => void;
  duracaoPorEtapaMs?: number;
}

export function CalculatingOverlay({ onFinalizar, duracaoPorEtapaMs = 650 }: CalculatingOverlayProps) {
  const [etapaAtual, setEtapaAtual] = useState(0);

  useEffect(() => {
    if (etapaAtual >= ETAPAS.length - 1) {
      const timeout = setTimeout(onFinalizar, duracaoPorEtapaMs);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setEtapaAtual((e) => e + 1), duracaoPorEtapaMs);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapaAtual]);

  const Icon = ETAPAS[etapaAtual].icon;

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-sun-400/25" />
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-sun-400 to-brand-teal-500 opacity-15" />
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy-800 to-brand-teal-600 shadow-glow-teal">
          <Icon size={26} className="text-brand-sun-300" />
        </span>
      </div>

      <div className="mt-7 flex items-center gap-2 text-brand-navy-900">
        <Loader2 size={16} className="animate-spin text-brand-teal-500" />
        <p key={etapaAtual} className="animate-fade-in font-display text-[16px] font-semibold">
          {ETAPAS[etapaAtual].texto}
        </p>
      </div>

      <div className="mt-6 flex gap-1.5">
        {ETAPAS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
              i <= etapaAtual ? 'bg-brand-teal-500' : 'bg-black/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
