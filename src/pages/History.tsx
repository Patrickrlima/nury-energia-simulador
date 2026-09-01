import { ChevronRight, Gauge, Globe2, MapPin, PlusCircle, Sun, User, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { atualizarStatusSimulacao, listarSimulacoes } from '../services/historyService';
import type { OrigemSimulacao, RegistroSimulacao, StatusSimulacao } from '../types/client';
import { ORIGEM_LABELS, STATUS_LABELS } from '../types/client';
import { formatarMoeda, formatarNumero } from '../utils/currency';

type Filtro = 'todos' | OrigemSimulacao;

const ORIGEM_ICON: Record<OrigemSimulacao, typeof Globe2> = { site: Globe2, vendedor: User };

function formatarDataRelativa(iso: string): string {
  const data = new Date(iso);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDias <= 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `Há ${diffDias} dias`;
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function HistoryPage() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<RegistroSimulacao[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  useEffect(() => {
    setRegistros(listarSimulacoes());
  }, []);

  const registrosFiltrados = useMemo(
    () => (filtro === 'todos' ? registros : registros.filter((r) => r.origem === filtro)),
    [registros, filtro]
  );

  const temLeadsDoSite = registros.some((r) => r.origem === 'site');

  const resumo = useMemo(() => {
    const totalClientes = registrosFiltrados.length;
    const economiaTotalMensal = registrosFiltrados.reduce((soma, r) => soma + r.economiaMensalEstimada, 0);
    const vendidos = registrosFiltrados.filter((r) => r.status === 'vendido').length;
    return { totalClientes, economiaTotalMensal, vendidos };
  }, [registrosFiltrados]);

  function mudarStatus(id: string, status: StatusSimulacao) {
    atualizarStatusSimulacao(id, status);
    setRegistros((atual) => atual.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <div className="min-h-svh bg-brand-mist">
      <Header onVoltar={() => navigate('/')} titulo="Minhas simulações" subtitulo={`${registros.length} registro${registros.length === 1 ? '' : 's'}`} mostrarHistorico={false} />

      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-5 sm:px-8">
        {registros.length > 0 && (
          <div className="animate-fade-up mb-5 grid grid-cols-3 gap-2.5">
            <ResumoCard icon={Users} rotulo="Clientes" valor={String(resumo.totalClientes)} />
            <ResumoCard icon={Sun} rotulo="Economia/mês" valor={formatarMoeda(resumo.economiaTotalMensal)} compacto />
            <ResumoCard icon={Gauge} rotulo="Vendidos" valor={String(resumo.vendidos)} />
          </div>
        )}

        {temLeadsDoSite && (
          <div className="animate-fade-up mb-4 flex gap-2 overflow-x-auto">
            {(['todos', 'site', 'vendedor'] as Filtro[]).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setFiltro(opcao)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                  filtro === opcao ? 'bg-brand-navy-900 text-white' : 'bg-white text-brand-slate ring-1 ring-black/8'
                }`}
              >
                {opcao === 'todos' ? 'Todos' : opcao === 'site' ? 'Vindos do site' : 'Feitos por vendedor'}
              </button>
            ))}
          </div>
        )}

        {registros.length === 0 ? (
          <div className="animate-fade-up mt-10 flex flex-col items-center rounded-3xl border border-dashed border-black/12 px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-mist text-brand-teal-600">
              <Sun size={24} />
            </span>
            <h2 className="mt-4 font-display text-[17px] font-bold text-brand-ink">Nenhuma simulação ainda</h2>
            <p className="mt-1.5 max-w-xs text-[13.5px] text-brand-slate">Suas simulações salvas aparecerão aqui para acompanhar o funil comercial.</p>
            <button
              type="button"
              onClick={() => navigate('/simulador')}
              className="mt-6 flex h-12 items-center gap-2 rounded-2xl bg-brand-navy-900 px-5 text-[14px] font-bold text-white active:scale-[0.98]"
            >
              <PlusCircle size={17} />
              Nova simulação
            </button>
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <p className="animate-fade-up mt-10 text-center text-[13.5px] text-brand-slate">Nenhum registro nesse filtro.</p>
        ) : (
          <div className="space-y-3">
            {registrosFiltrados.map((registro) => {
              const OrigemIcon = ORIGEM_ICON[registro.origem];
              return (
              <div
                key={registro.id}
                onClick={() => navigate('/resultado', { state: { resultado: registro.resultado, registroId: registro.id } })}
                className="animate-fade-up cursor-pointer rounded-2xl border border-black/6 bg-white p-4 shadow-soft transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-display text-[15px] font-bold text-brand-ink">{registro.nomeCliente || 'Cliente sem nome'}</p>
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-mist px-2 py-0.5 text-[10px] font-bold text-brand-slate">
                        <OrigemIcon size={10} />
                        {ORIGEM_LABELS[registro.origem]}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-brand-slate">
                      <MapPin size={12} />
                      {registro.cidade}
                      {registro.estado ? `/${registro.estado}` : ''} · {formatarDataRelativa(registro.criadoEm)}
                    </p>
                  </div>
                  <ChevronRight size={18} className="mt-0.5 shrink-0 text-brand-slate/50" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-brand-slate">
                  <span>{formatarNumero(registro.consumoMensalKwh)} kWh/mês</span>
                  <span>{formatarNumero(registro.potenciaTotalInstaladaKwp, 2)} kWp</span>
                  <span>{registro.numeroDeModulos} módulos</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold text-brand-slate">Economia estimada</p>
                    <p className="font-display text-[16px] font-extrabold text-brand-teal-700">{formatarMoeda(registro.economiaMensalEstimada)}/mês</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={registro.status} />
                    <select
                      value={registro.status}
                      onChange={(e) => mudarStatus(registro.id, e.target.value as StatusSimulacao)}
                      className="h-7 rounded-full border-0 bg-brand-mist px-2.5 text-[11px] font-semibold text-brand-slate outline-none"
                    >
                      {(Object.keys(STATUS_LABELS) as StatusSimulacao[]).map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>

      {registros.length > 0 && (
        <button
          type="button"
          onClick={() => navigate('/simulador')}
          aria-label="Nova simulação"
          className="fixed bottom-6 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-sun-500 to-brand-sun-400 text-brand-navy-900 shadow-glow-sun active:scale-95 sm:right-8"
        >
          <PlusCircle size={24} />
        </button>
      )}
    </div>
  );
}

function ResumoCard({ icon: Icon, rotulo, valor, compacto }: { icon: typeof Sun; rotulo: string; valor: string; compacto?: boolean }) {
  return (
    <div className="rounded-2xl border border-black/6 bg-white p-3 text-center">
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mist text-brand-teal-600">
        <Icon size={15} />
      </span>
      <p className={`mt-1.5 font-display font-extrabold text-brand-ink ${compacto ? 'text-[13px]' : 'text-[15px]'}`}>{valor}</p>
      <p className="text-[10.5px] font-semibold text-brand-slate">{rotulo}</p>
    </div>
  );
}
