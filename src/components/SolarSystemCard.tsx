import { Sun, SunMedium, Zap } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import type { ResultadoSimulacao } from '../types/solar';
import { formatarNumero } from '../utils/currency';
import { StatCard } from './ui/StatCard';

interface SolarSystemCardProps {
  resultado: ResultadoSimulacao;
}

export function SolarSystemCard({ resultado }: SolarSystemCardProps) {
  const kwp = useCountUp(resultado.potenciaTotalInstaladaKwp, 800);
  const modulos = useCountUp(resultado.numeroDeModulos, 800, 80);
  const geracao = useCountUp(resultado.geracaoMensalEstimadaKwh, 900, 160);

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      <StatCard icon={Sun} label="Sistema estimado" value={`${formatarNumero(kwp, 2)}`} sublabel="kWp" tone="dark" badge="Estimativa" />
      <StatCard icon={SunMedium} label="Painéis estimados" value={Math.round(modulos)} sublabel="módulos" tone="light" />
      <StatCard icon={Zap} label="Geração estimada" value={formatarNumero(geracao)} sublabel="kWh/mês" tone="light" />
    </div>
  );
}
