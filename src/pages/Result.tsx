import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { SimulationResult } from '../components/SimulationResult';
import { useAudience } from '../context/AudienceContext';
import { useSimulador } from '../context/SimuladorContext';
import type { ResultadoSimulacao } from '../types/solar';

export function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { basePath } = useAudience();
  const { resultado: resultadoAtual } = useSimulador();
  const estadoRota = location.state as { registroId?: string; resultado?: ResultadoSimulacao } | null;
  const resultado = estadoRota?.resultado ?? resultadoAtual;
  const registroId = estadoRota?.registroId ?? null;

  useEffect(() => {
    if (!resultado) navigate(`${basePath}/simulador`, { replace: true });
  }, [resultado, navigate, basePath]);

  if (!resultado) return null;

  return (
    <div className="min-h-svh bg-brand-mist">
      <Header onVoltar={() => navigate(`${basePath}/simulador`)} titulo="Resultado da simulação" subtitulo={resultado.parametros.cliente.cidade} />
      <SimulationResult resultado={resultado} registroId={registroId} />
    </div>
  );
}
