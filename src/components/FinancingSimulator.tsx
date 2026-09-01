import { Landmark, Percent, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FINANCIAMENTO_PADRAO } from '../config/solarConfig';
import { calcularFinanciamento } from '../services/solarCalculator';
import { formatarMoeda, parseNumeroBR } from '../utils/currency';
import { FormField } from './ui/FormField';

interface FinancingSimulatorProps {
  economiaMensalEstimada: number;
  valorSistemaSugerido?: number;
}

/**
 * Simulação de financiamento — seção modular/futura.
 * Fica desativada por padrão (o vendedor ativa quando quiser explorar essa
 * argumentação com o cliente), preparada para ganhar integrações reais depois.
 */
export function FinancingSimulator({ economiaMensalEstimada, valorSistemaSugerido }: FinancingSimulatorProps) {
  const [ativo, setAtivo] = useState(false);
  const [valorSistemaTexto, setValorSistemaTexto] = useState(String(valorSistemaSugerido ?? 25000));
  const [entradaTexto, setEntradaTexto] = useState('0');
  const [parcelas, setParcelas] = useState(FINANCIAMENTO_PADRAO.numeroParcelas);
  const [taxaTexto, setTaxaTexto] = useState(String(FINANCIAMENTO_PADRAO.taxaJurosMensal));

  useEffect(() => {
    if (valorSistemaSugerido) setValorSistemaTexto(String(valorSistemaSugerido));
  }, [valorSistemaSugerido]);

  const valorSistema = parseNumeroBR(valorSistemaTexto);
  const entrada = parseNumeroBR(entradaTexto);
  const taxa = parseNumeroBR(taxaTexto);

  const resultado =
    valorSistema > 0
      ? calcularFinanciamento({ valorSistema, valorEntrada: entrada, numeroParcelas: parcelas, taxaJurosMensal: taxa }, economiaMensalEstimada)
      : null;

  return (
    <div className="animate-fade-up overflow-hidden rounded-3xl border border-black/6 bg-white shadow-soft">
      <div className="flex items-center justify-between px-5 py-4 sm:px-6">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mist text-brand-teal-600">
            <Landmark size={17} />
          </span>
          <span className="text-left">
            <span className="block font-display text-[15.5px] font-bold text-brand-ink">Simular financiamento</span>
            <span className="block text-[12px] text-brand-slate">Seção opcional — em breve com condições reais</span>
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={ativo}
          onClick={() => setAtivo((v) => !v)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${ativo ? 'bg-brand-teal-500' : 'bg-black/12'}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${ativo ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {ativo && (
        <div className="space-y-4 border-t border-black/6 px-5 pb-5 pt-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valor do sistema" icon={<Wallet size={18} />} suffix="R$" inputMode="decimal" value={valorSistemaTexto} onChange={(e) => setValorSistemaTexto(e.target.value)} />
            <FormField label="Entrada" icon={<Wallet size={18} />} suffix="R$" inputMode="decimal" value={entradaTexto} onChange={(e) => setEntradaTexto(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Parcelas"
              inputMode="numeric"
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value) || 0)}
              suffix="meses"
            />
            <FormField label="Taxa de juros" icon={<Percent size={18} />} suffix="% a.m." inputMode="decimal" value={taxaTexto} onChange={(e) => setTaxaTexto(e.target.value)} />
          </div>

          {resultado && (
            <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-brand-mist p-3.5">
              <MiniStat rotulo="Parcela estimada" valor={formatarMoeda(resultado.parcelaEstimada)} />
              <MiniStat rotulo="Economia estimada" valor={formatarMoeda(resultado.economiaMensalEstimada)} />
              <MiniStat
                rotulo="Diferença"
                valor={`${resultado.diferencaMensal >= 0 ? '+' : '-'}${formatarMoeda(Math.abs(resultado.diferencaMensal))}`}
                destaque={resultado.diferencaMensal <= 0}
              />
            </div>
          )}

          <p className="text-[11px] leading-relaxed text-brand-slate">
            Simulação de financiamento com caráter ilustrativo. Condições reais dependem de análise de crédito e da instituição financeira.
          </p>
        </div>
      )}
    </div>
  );
}

function MiniStat({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-brand-slate">{rotulo}</p>
      <p className={`mt-0.5 font-display text-[13.5px] font-extrabold leading-tight ${destaque ? 'text-brand-teal-600' : 'text-brand-ink'}`}>{valor}</p>
    </div>
  );
}
