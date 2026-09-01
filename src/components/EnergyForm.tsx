import { AlertTriangle, ChevronDown, CircleHelp, FileScan, Gauge, Loader2, Receipt, Settings2, Zap } from 'lucide-react';
import { useRef, useState } from 'react';
import { MODULOS_DISPONIVEIS } from '../config/solarConfig';
import { useAudience } from '../context/AudienceContext';
import { leituraAutomaticaDisponivel, lerFaturaAutomaticamente, type DadosExtraidosFatura } from '../services/faturaReaderService';
import type { DadosContaEnergia, PotenciaModuloWp } from '../types/solar';
import { FormField } from './ui/FormField';

interface EnergyFormProps {
  dados: DadosContaEnergia;
  onChange: (dados: Partial<DadosContaEnergia>) => void;
  potenciaModuloWp: PotenciaModuloWp;
  onChangePotenciaModulo: (potencia: PotenciaModuloWp) => void;
  onContinuar: () => void;
  onVoltar: () => void;
}

export function EnergyForm({ dados, onChange, potenciaModuloWp, onChangePotenciaModulo, onContinuar }: EnergyFormProps) {
  const [avancadoAberto, setAvancadoAberto] = useState(false);
  const { audiencia } = useAudience();
  const mostrarAvancado = audiencia === 'vendedor';

  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const [lendoFatura, setLendoFatura] = useState(false);
  const [erroLeitura, setErroLeitura] = useState<string | null>(null);
  const [leituraOk, setLeituraOk] = useState<DadosExtraidosFatura | null>(null);

  const valido =
    dados.formaEntrada === 'consumo'
      ? (dados.consumoMensalKwh ?? 0) > 0
      : (dados.valorContaMensal ?? 0) > 0;

  function selecionarAba(aba: 'consumo' | 'valorConta') {
    onChange({ formaEntrada: aba });
  }

  async function lidarComArquivoSelecionado(arquivo: File | undefined) {
    if (!arquivo) return;
    setErroLeitura(null);
    setLeituraOk(null);
    setLendoFatura(true);
    try {
      const extraido = await lerFaturaAutomaticamente(arquivo);
      if (!extraido.consumoKwh || extraido.consumoKwh <= 0) {
        setErroLeitura('Não consegui encontrar o consumo em kWh nessa fatura. Preencha manualmente abaixo.');
        return;
      }
      onChange({
        formaEntrada: 'consumo',
        consumoMensalKwh: extraido.consumoKwh,
        tarifaPersonalizadaKwh: extraido.tarifaMediaKwh ?? undefined,
      });
      setLeituraOk(extraido);
    } catch (erro) {
      setErroLeitura(erro instanceof Error ? erro.message : 'Não consegui ler essa fatura. Preencha manualmente abaixo.');
    } finally {
      setLendoFatura(false);
      if (inputArquivoRef.current) inputArquivoRef.current.value = '';
    }
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h2 className="font-display text-[22px] font-bold text-brand-ink">Sua conta de energia</h2>
        <p className="mt-1 text-[14px] text-brand-slate">Use o consumo em kWh ou apenas o valor da conta — o que for mais rápido.</p>
      </div>

      {leituraAutomaticaDisponivel() && (
        <div className="rounded-2xl border border-dashed border-brand-teal-500/40 bg-brand-teal-500/6 p-4">
          <input
            ref={inputArquivoRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => lidarComArquivoSelecionado(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={lendoFatura}
            onClick={() => inputArquivoRef.current?.click()}
            className="flex w-full items-center gap-3 text-left disabled:opacity-70"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal-500/15 text-brand-teal-700">
              {lendoFatura ? <Loader2 size={20} className="animate-spin" /> : <FileScan size={20} />}
            </span>
            <span>
              <span className="block text-[13.5px] font-semibold text-brand-navy-900">
                {lendoFatura ? 'Lendo sua conta de luz…' : 'Preencher automaticamente com foto/PDF da conta'}
              </span>
              <span className="block text-[12px] text-brand-slate">
                {lendoFatura ? 'Isso leva alguns segundos.' : 'Tira uma foto ou anexa o PDF — a gente lê o consumo e a tarifa reais.'}
              </span>
            </span>
          </button>

          {leituraOk && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-[12.5px] leading-relaxed text-brand-navy-800">
              <FileScan size={15} className="mt-0.5 shrink-0 text-brand-teal-600" />
              Lemos {leituraOk.consumoKwh?.toLocaleString('pt-BR')} kWh
              {leituraOk.tarifaMediaKwh ? ` a R$ ${leituraOk.tarifaMediaKwh.toFixed(4)}/kWh` : ''}. Confira os campos abaixo antes de simular.
            </p>
          )}
          {erroLeitura && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-amber-800">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
              {erroLeitura}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-mist p-1.5">
        <button
          type="button"
          onClick={() => selecionarAba('consumo')}
          className={`flex h-11 items-center justify-center gap-1.5 rounded-xl text-[13.5px] font-semibold transition ${
            dados.formaEntrada === 'consumo' ? 'bg-white text-brand-navy-900 shadow-sm' : 'text-brand-slate'
          }`}
        >
          <Zap size={15} />
          Consumo (kWh)
        </button>
        <button
          type="button"
          onClick={() => selecionarAba('valorConta')}
          className={`flex h-11 items-center justify-center gap-1.5 rounded-xl text-[13.5px] font-semibold transition ${
            dados.formaEntrada === 'valorConta' ? 'bg-white text-brand-navy-900 shadow-sm' : 'text-brand-slate'
          }`}
        >
          <Receipt size={15} />
          Valor da conta
        </button>
      </div>

      {dados.formaEntrada === 'consumo' ? (
        <div className="space-y-3">
          <FormField
            label="Consumo médio mensal"
            icon={<Gauge size={18} />}
            suffix="kWh"
            inputMode="decimal"
            placeholder="Ex.: 500"
            value={dados.consumoMensalKwh ?? ''}
            onChange={(e) => onChange({ consumoMensalKwh: e.target.value ? Number(e.target.value) : undefined })}
          />
          <button
            type="button"
            onClick={() => selecionarAba('valorConta')}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-teal-600 underline decoration-dotted underline-offset-4"
          >
            <CircleHelp size={14} />
            Não sei meu consumo em kWh
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <FormField
            label="Valor médio mensal da conta"
            icon={<Receipt size={18} />}
            suffix="R$"
            inputMode="decimal"
            placeholder="Ex.: 550,00"
            value={dados.valorContaMensal ?? ''}
            onChange={(e) => onChange({ valorContaMensal: e.target.value ? Number(e.target.value) : undefined })}
          />
          <div className="flex items-start gap-2.5 rounded-2xl bg-brand-teal-500/8 px-4 py-3 text-[12.5px] leading-relaxed text-brand-navy-800">
            <CircleHelp size={16} className="mt-0.5 shrink-0 text-brand-teal-600" />
            <p>Sem problema. Podemos fazer uma estimativa com base no valor médio da sua conta.</p>
          </div>
        </div>
      )}

      {mostrarAvancado && (
        <div className="rounded-2xl border border-black/8 bg-white">
          <button
            type="button"
            onClick={() => setAvancadoAberto((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3.5 text-[13.5px] font-semibold text-brand-navy-900"
          >
            <span className="flex items-center gap-2">
              <Settings2 size={16} className="text-brand-slate" />
              Configurações avançadas
            </span>
            <ChevronDown size={17} className={`text-brand-slate transition-transform ${avancadoAberto ? 'rotate-180' : ''}`} />
          </button>
          {avancadoAberto && (
            <div className="border-t border-black/6 px-4 py-4">
              <span className="mb-2 block text-[12.5px] font-semibold text-brand-slate">Módulo fotovoltaico (potência)</span>
              <div className="grid grid-cols-5 gap-2">
                {MODULOS_DISPONIVEIS.map((potencia) => (
                  <button
                    key={potencia}
                    type="button"
                    onClick={() => onChangePotenciaModulo(potencia)}
                    className={`flex h-11 items-center justify-center rounded-xl text-[12.5px] font-bold transition ${
                      potenciaModuloWp === potencia
                        ? 'bg-brand-navy-900 text-white'
                        : 'bg-brand-mist text-brand-navy-800 hover:bg-brand-mist-2'
                    }`}
                  >
                    {potencia}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11.5px] text-brand-slate">Wp por módulo · usado para estimar a quantidade de painéis.</p>

              <div className="mt-4 border-t border-black/6 pt-4">
                <FormField
                  label="Tarifa real do cliente (opcional)"
                  icon={<Receipt size={18} />}
                  suffix="R$/kWh"
                  inputMode="decimal"
                  placeholder="Ex.: 1,0328"
                  value={dados.tarifaPersonalizadaKwh ?? ''}
                  onChange={(e) =>
                    onChange({ tarifaPersonalizadaKwh: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
                <p className="mt-2 text-[11.5px] text-brand-slate">
                  Some a Tarifa TE + Tarifa TU da fatura (já com impostos). Deixe em branco para usar a média
                  nacional. Preenchido automaticamente quando você usa a leitura por foto/PDF acima.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!valido}
        onClick={onContinuar}
        className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-sun-500 to-brand-sun-400 text-[15px] font-bold tracking-wide text-brand-navy-900 shadow-glow-sun transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-none disabled:bg-black/10 disabled:text-brand-slate disabled:shadow-none"
      >
        CALCULAR SIMULAÇÃO
      </button>
    </div>
  );
}
