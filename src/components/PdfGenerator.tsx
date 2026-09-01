import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { gerarPdfSimulacao } from '../services/pdfService';
import type { ResultadoPayback, ResultadoSimulacao } from '../types/solar';

interface PdfGeneratorProps {
  resultado: ResultadoSimulacao;
  payback?: ResultadoPayback | null;
  variante?: 'solido' | 'contorno';
}

export function PdfGenerator({ resultado, payback, variante = 'contorno' }: PdfGeneratorProps) {
  const [gerando, setGerando] = useState(false);

  async function handleClick() {
    setGerando(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      gerarPdfSimulacao(resultado, payback);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={gerando}
      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-5 text-[14.5px] font-bold tracking-wide transition active:scale-[0.98] disabled:opacity-70 ${
        variante === 'solido'
          ? 'bg-brand-navy-900 text-white shadow-lift'
          : 'border-2 border-brand-navy-900/15 bg-white text-brand-navy-900'
      }`}
    >
      {gerando ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
      <span className="whitespace-nowrap">GERAR PDF</span>
    </button>
  );
}
