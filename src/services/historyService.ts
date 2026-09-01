import type { OrigemSimulacao, RegistroSimulacao, StatusSimulacao } from '../types/client';
import type { ResultadoSimulacao } from '../types/solar';

/**
 * Persistência local do histórico de simulações ("Minhas simulações").
 * Hoje usa localStorage — isolado numa camada de serviço para que, no futuro,
 * possa ser trocado por uma API/backend real (CRM) sem alterar as telas.
 *
 * IMPORTANTE: por ser localStorage, cada registro fica salvo apenas no navegador
 * onde a simulação foi feita. Isso é suficiente para o vendedor ver seu próprio
 * histórico no aparelho dele, mas NÃO faz uma simulação feita por um visitante no
 * site (`/simule`) aparecer automaticamente no painel de outra pessoa — para captar
 * esses leads de verdade (ex.: notificar a equipe, cair num CRM), é necessário
 * plugar aqui uma chamada a um backend/planilha/CRM real.
 */

const STORAGE_KEY = 'nury-energia:historico-simulacoes';

function lerTudo(): RegistroSimulacao[] {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    if (!bruto) return [];
    const dados = JSON.parse(bruto);
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarTudo(registros: RegistroSimulacao[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
  } catch {
    // Armazenamento indisponível (modo privado, etc.) — falha silenciosa,
    // já que o histórico é um recurso auxiliar e não deve travar o simulador.
  }
}

export function listarSimulacoes(): RegistroSimulacao[] {
  return lerTudo().sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
}

export function salvarSimulacao(resultado: ResultadoSimulacao, origem: OrigemSimulacao = 'vendedor'): RegistroSimulacao {
  const { parametros } = resultado;
  const registro: RegistroSimulacao = {
    id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    criadoEm: new Date().toISOString(),
    origem,
    nomeCliente: parametros.cliente.nome,
    whatsapp: parametros.cliente.whatsapp,
    cidade: parametros.cliente.cidade,
    estado: parametros.cliente.estado,
    tipoInstalacao: parametros.cliente.tipoInstalacao,
    consumoMensalKwh: resultado.consumoMensalEstimadoKwh,
    potenciaTotalInstaladaKwp: resultado.potenciaTotalInstaladaKwp,
    numeroDeModulos: resultado.numeroDeModulos,
    economiaMensalEstimada: resultado.economiaMensalEstimada,
    economiaAnualEstimada: resultado.economiaAnualEstimada,
    status: 'simulacao',
    resultado,
  };

  const registros = lerTudo();
  registros.push(registro);
  salvarTudo(registros);
  return registro;
}

export function atualizarStatusSimulacao(id: string, status: StatusSimulacao): void {
  const registros = lerTudo();
  const atualizados = registros.map((registro) => (registro.id === id ? { ...registro, status } : registro));
  salvarTudo(atualizados);
}

export function removerSimulacao(id: string): void {
  const registros = lerTudo().filter((registro) => registro.id !== id);
  salvarTudo(registros);
}
