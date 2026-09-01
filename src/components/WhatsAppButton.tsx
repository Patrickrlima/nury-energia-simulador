import { MessageCircle } from 'lucide-react';
import { abrirWhatsapp, abrirWhatsappAutoatendimento } from '../services/whatsappService';
import type { ResultadoSimulacao } from '../types/solar';

interface WhatsAppButtonProps {
  resultado: ResultadoSimulacao;
  destino?: 'cliente' | 'consultor';
  /** 'vendedor' = mensagem escrita como o vendedor falando com o cliente/consultor (padrão).
   *  'autoatendimento' = mensagem em 1ª pessoa, usada no simulador público (o próprio visitante fala com a Nury). */
  perspectiva?: 'vendedor' | 'autoatendimento';
  variante?: 'solido' | 'contorno';
  children: React.ReactNode;
  onClick?: () => void;
}

export function WhatsAppButton({
  resultado,
  destino = 'cliente',
  perspectiva = 'vendedor',
  variante = 'solido',
  children,
  onClick,
}: WhatsAppButtonProps) {
  function handleClick() {
    if (perspectiva === 'autoatendimento') {
      abrirWhatsappAutoatendimento(resultado);
    } else {
      abrirWhatsapp(resultado, destino);
    }
    onClick?.();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-5 text-[14.5px] font-bold tracking-wide transition active:scale-[0.98] ${
        variante === 'solido'
          ? 'bg-brand-whats text-white shadow-[0_10px_30px_-8px_rgba(34,197,94,0.55)] hover:bg-brand-whats-dark'
          : 'border-2 border-brand-whats/30 bg-white text-brand-whats-dark hover:bg-brand-whats/5'
      }`}
    >
      <MessageCircle size={19} />
      {children}
    </button>
  );
}
