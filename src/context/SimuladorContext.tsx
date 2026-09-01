import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { POTENCIA_MODULO_PADRAO } from '../config/solarConfig';
import { calcularSimulacao } from '../services/solarCalculator';
import type { DadosClienteSimulacao, DadosContaEnergia, PotenciaModuloWp, ResultadoSimulacao } from '../types/solar';

interface SimuladorState {
  cliente: DadosClienteSimulacao;
  conta: DadosContaEnergia;
  potenciaModuloWp: PotenciaModuloWp;
  resultado: ResultadoSimulacao | null;
}

interface SimuladorContextValue extends SimuladorState {
  atualizarCliente: (dados: Partial<DadosClienteSimulacao>) => void;
  atualizarConta: (dados: Partial<DadosContaEnergia>) => void;
  definirPotenciaModulo: (potencia: PotenciaModuloWp) => void;
  calcular: () => ResultadoSimulacao;
  reiniciar: () => void;
}

const clienteInicial: DadosClienteSimulacao = {
  nome: '',
  whatsapp: '',
  cidade: '',
  estado: '',
  tipoInstalacao: 'residencial',
};

const contaInicial: DadosContaEnergia = {
  formaEntrada: 'valorConta',
  consumoMensalKwh: undefined,
  valorContaMensal: undefined,
  naoSeiConsumo: false,
};

const SESSION_KEY = 'nury-energia:simulacao-atual';

function carregarResultadoSalvo(): ResultadoSimulacao | null {
  try {
    const bruto = sessionStorage.getItem(SESSION_KEY);
    return bruto ? (JSON.parse(bruto) as ResultadoSimulacao) : null;
  } catch {
    return null;
  }
}

const SimuladorContext = createContext<SimuladorContextValue | null>(null);

export function SimuladorProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<DadosClienteSimulacao>(clienteInicial);
  const [conta, setConta] = useState<DadosContaEnergia>(contaInicial);
  const [potenciaModuloWp, setPotenciaModuloWp] = useState<PotenciaModuloWp>(POTENCIA_MODULO_PADRAO);
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(() => carregarResultadoSalvo());

  const atualizarCliente = useCallback((dados: Partial<DadosClienteSimulacao>) => {
    setCliente((atual) => ({ ...atual, ...dados }));
  }, []);

  const atualizarConta = useCallback((dados: Partial<DadosContaEnergia>) => {
    setConta((atual) => ({ ...atual, ...dados }));
  }, []);

  const definirPotenciaModulo = useCallback((potencia: PotenciaModuloWp) => {
    setPotenciaModuloWp(potencia);
  }, []);

  const calcular = useCallback((): ResultadoSimulacao => {
    const resultadoCalculado = calcularSimulacao({ cliente, conta, potenciaModuloWp });
    setResultado(resultadoCalculado);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(resultadoCalculado));
    } catch {
      // sessão indisponível — segue sem persistir
    }
    return resultadoCalculado;
  }, [cliente, conta, potenciaModuloWp]);

  const reiniciar = useCallback(() => {
    setCliente(clienteInicial);
    setConta(contaInicial);
    setPotenciaModuloWp(POTENCIA_MODULO_PADRAO);
    setResultado(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignora
    }
  }, []);

  const value = useMemo<SimuladorContextValue>(
    () => ({
      cliente,
      conta,
      potenciaModuloWp,
      resultado,
      atualizarCliente,
      atualizarConta,
      definirPotenciaModulo,
      calcular,
      reiniciar,
    }),
    [cliente, conta, potenciaModuloWp, resultado, atualizarCliente, atualizarConta, definirPotenciaModulo, calcular, reiniciar]
  );

  return <SimuladorContext.Provider value={value}>{children}</SimuladorContext.Provider>;
}

export function useSimulador(): SimuladorContextValue {
  const ctx = useContext(SimuladorContext);
  if (!ctx) throw new Error('useSimulador precisa ser usado dentro de <SimuladorProvider>');
  return ctx;
}
