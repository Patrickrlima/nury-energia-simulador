import { ArrowLeft, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoNury from '../assets/logo-nury.png';
import { EMPRESA } from '../config/solarConfig';
import { useAudience } from '../context/AudienceContext';

interface HeaderProps {
  titulo?: string;
  subtitulo?: string;
  onVoltar?: () => void;
  /** Por padrão, só aparece no app do vendedor — a versão pública não expõe o histórico interno. */
  mostrarHistorico?: boolean;
  variante?: 'claro' | 'transparente';
}

export function Header({ titulo, subtitulo, onVoltar, mostrarHistorico, variante = 'claro' }: HeaderProps) {
  const navigate = useNavigate();
  const { audiencia, basePath } = useAudience();
  const isTransparente = variante === 'transparente';
  const exibirHistorico = mostrarHistorico ?? audiencia === 'vendedor';

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 ${
        isTransparente ? 'bg-transparent' : 'border-b border-black/5 bg-white/85 backdrop-blur-md'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {onVoltar ? (
          <button
            type="button"
            onClick={onVoltar}
            aria-label="Voltar"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
              isTransparente ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-brand-mist text-brand-navy-900 hover:bg-brand-mist-2'
            }`}
          >
            <ArrowLeft size={19} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(basePath || '/')}
            aria-label={EMPRESA.nome}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-glow-sun"
          >
            <img src={logoNury} alt={EMPRESA.nome} className="h-full w-full rounded-full object-cover" />
          </button>
        )}
        <div className="min-w-0">
          <p className={`truncate font-display text-[15px] font-bold leading-tight ${isTransparente ? 'text-white' : 'text-brand-ink'}`}>
            {titulo ?? EMPRESA.nome}
          </p>
          {subtitulo && (
            <p className={`truncate text-[12px] leading-tight ${isTransparente ? 'text-white/75' : 'text-brand-slate'}`}>{subtitulo}</p>
          )}
        </div>
      </div>

      {exibirHistorico && (
        <button
          type="button"
          onClick={() => navigate('/simulacoes')}
          className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition active:scale-95 ${
            isTransparente
              ? 'bg-white/15 text-white hover:bg-white/25'
              : 'bg-brand-mist text-brand-navy-800 hover:bg-brand-mist-2'
          }`}
        >
          <History size={16} />
          <span className="hidden sm:inline">Minhas simulações</span>
        </button>
      )}
    </header>
  );
}
