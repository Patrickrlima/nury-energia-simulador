import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalculatingOverlay } from '../components/CalculatingOverlay';
import { ClientForm } from '../components/ClientForm';
import { EnergyForm } from '../components/EnergyForm';
import { Header } from '../components/Header';
import { StepIndicator } from '../components/StepIndicator';
import { useAudience } from '../context/AudienceContext';
import { useSimulador } from '../context/SimuladorContext';
import { salvarSimulacao } from '../services/historyService';

type Etapa = 'cliente' | 'energia' | 'calculando';

const ROTULOS = ['Dados do cliente', 'Conta de energia'];

export function Simulator() {
  const navigate = useNavigate();
  const { audiencia, basePath } = useAudience();
  const { cliente, conta, potenciaModuloWp, atualizarCliente, atualizarConta, definirPotenciaModulo, calcular } = useSimulador();
  const [etapa, setEtapa] = useState<Etapa>('cliente');

  function finalizarCalculo() {
    const resultado = calcular();
    const registro = salvarSimulacao(resultado, audiencia);
    navigate(`${basePath}/resultado`, { state: { registroId: registro.id } });
  }

  function voltar() {
    if (etapa === 'energia') setEtapa('cliente');
    else navigate(basePath || '/');
  }

  return (
    <div className="min-h-svh bg-brand-mist">
      <Header
        onVoltar={voltar}
        titulo="Nova simulação"
        subtitulo={etapa === 'calculando' ? 'Processando' : undefined}
        mostrarHistorico={audiencia === 'vendedor' && etapa !== 'calculando'}
      />

      {etapa !== 'calculando' && (
        <div className="px-5 pt-3 sm:px-8">
          <StepIndicator etapaAtual={etapa === 'cliente' ? 0 : 1} totalEtapas={2} rotulos={ROTULOS} />
        </div>
      )}

      <main className="mx-auto w-full max-w-md px-5 pb-14 pt-6 sm:px-8">
        {etapa === 'cliente' && (
          <ClientForm dados={cliente} onChange={atualizarCliente} onContinuar={() => setEtapa('energia')} />
        )}
        {etapa === 'energia' && (
          <EnergyForm
            dados={conta}
            onChange={atualizarConta}
            potenciaModuloWp={potenciaModuloWp}
            onChangePotenciaModulo={definirPotenciaModulo}
            onContinuar={() => setEtapa('calculando')}
            onVoltar={() => setEtapa('cliente')}
          />
        )}
        {etapa === 'calculando' && <CalculatingOverlay onFinalizar={finalizarCalculo} />}
      </main>
    </div>
  );
}
