import { EMPRESA } from '../config/solarConfig';
import type { ResultadoSimulacao } from '../types/solar';
import { formatarMoeda, formatarNumero } from '../utils/currency';

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Monta o número de WhatsApp do cliente no formato internacional (com DDI 55). */
export function normalizarWhatsapp(whatsapp: string): string {
  const digitos = somenteDigitos(whatsapp);
  if (digitos.startsWith('55')) return digitos;
  return `55${digitos}`;
}

/** Gera a mensagem comercial sugerida para envio da simulação. */
export function montarMensagemSimulacao(resultado: ResultadoSimulacao): string {
  const { parametros, potenciaTotalInstaladaKwp, numeroDeModulos, economiaMensalEstimada, economiaAnualEstimada } =
    resultado;
  const primeiroNome = parametros.cliente.nome.trim().split(' ')[0] || parametros.cliente.nome;

  return (
    `Olá${primeiroNome ? ', ' + primeiroNome : ''}! Aqui é da ${EMPRESA.nome} ☀️\n\n` +
    `Fiz uma simulação preliminar do seu sistema de energia solar e encontrei um potencial de economia de aproximadamente ${formatarMoeda(
      economiaMensalEstimada
    )} por mês.\n\n` +
    `📊 Resumo da simulação:\n` +
    `• Sistema estimado: ${formatarNumero(potenciaTotalInstaladaKwp, 2)} kWp\n` +
    `• Painéis estimados: ${numeroDeModulos} módulos\n` +
    `• Economia mensal estimada: ${formatarMoeda(economiaMensalEstimada)}\n` +
    `• Economia anual estimada: ${formatarMoeda(economiaAnualEstimada)}\n\n` +
    `Essa é uma simulação preliminar — o dimensionamento definitivo depende de uma análise técnica do seu imóvel. Gostaria de receber uma proposta completa? 🙂`
  );
}

/**
 * Mensagem em primeira pessoa, usada quando é o próprio visitante do site quem
 * simulou (não um vendedor simulando para/com o cliente). Vai sempre para o
 * WhatsApp comercial da Nury Energia.
 */
export function montarMensagemAutoatendimento(resultado: ResultadoSimulacao): string {
  const { potenciaTotalInstaladaKwp, numeroDeModulos, economiaMensalEstimada, economiaAnualEstimada, parametros } = resultado;
  const primeiroNome = parametros.cliente.nome.trim().split(' ')[0] || '';

  return (
    `Olá! Sou${primeiroNome ? ' ' + primeiroNome : ''} e fiz uma simulação no site da ${EMPRESA.nome} ☀️\n\n` +
    `O resultado mostrou um potencial de economia de aproximadamente ${formatarMoeda(economiaMensalEstimada)} por mês.\n\n` +
    `📊 Resumo da minha simulação:\n` +
    `• Sistema estimado: ${formatarNumero(potenciaTotalInstaladaKwp, 2)} kWp\n` +
    `• Painéis estimados: ${numeroDeModulos} módulos\n` +
    `• Economia mensal estimada: ${formatarMoeda(economiaMensalEstimada)}\n` +
    `• Economia anual estimada: ${formatarMoeda(economiaAnualEstimada)}\n\n` +
    `Gostaria de conversar com um consultor e receber uma proposta completa. 🙂`
  );
}

/** Gera o link wa.me pronto para abrir a conversa com a mensagem preenchida. */
export function gerarLinkWhatsapp(resultado: ResultadoSimulacao, destino: 'cliente' | 'consultor' = 'cliente'): string {
  const mensagem = montarMensagemSimulacao(resultado);
  const numero =
    destino === 'cliente' ? normalizarWhatsapp(resultado.parametros.cliente.whatsapp) : EMPRESA.telefoneComercial;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/** Variante usada no simulador público: mensagem em 1ª pessoa, sempre para o WhatsApp comercial da Nury. */
export function gerarLinkWhatsappAutoatendimento(resultado: ResultadoSimulacao): string {
  const mensagem = montarMensagemAutoatendimento(resultado);
  return `https://wa.me/${EMPRESA.telefoneComercial}?text=${encodeURIComponent(mensagem)}`;
}

export function abrirWhatsapp(resultado: ResultadoSimulacao, destino: 'cliente' | 'consultor' = 'cliente'): void {
  const url = gerarLinkWhatsapp(resultado, destino);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function abrirWhatsappAutoatendimento(resultado: ResultadoSimulacao): void {
  const url = gerarLinkWhatsappAutoatendimento(resultado);
  window.open(url, '_blank', 'noopener,noreferrer');
}
