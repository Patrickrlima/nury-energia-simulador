import { ArrowRight, ShieldCheck, Sparkles, Timer, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackgroundVideo } from '../components/BackgroundVideo';
import { Header } from '../components/Header';
import { SolarIllustration } from '../components/icons/SolarIllustration';
import { EMPRESA } from '../config/solarConfig';
import { useAudience } from '../context/AudienceContext';

const SELOS = [
  { icon: Timer, texto: 'Simulação em 2 minutos' },
  { icon: Wifi, texto: '100% online' },
  { icon: ShieldCheck, texto: 'Sem compromisso' },
];

export function Home() {
  const navigate = useNavigate();
  const { audiencia, basePath } = useAudience();
  const ehPublico = audiencia === 'site';

  return (
    <div className="relative min-h-svh overflow-hidden bg-brand-navy-900">
      {/* fundo: vídeo em loop (só simulador público) + gradiente + glow solar decorativo */}
      {ehPublico && <BackgroundVideo srcMp4="/video/solar-hero.mp4" poster="/video/solar-hero-poster.jpg" />}
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_-4%,#f6a82133,transparent_45%),radial-gradient(circle_at_-6%_38%,#10b3a333,transparent_42%),linear-gradient(160deg,#082032_0%,#0d3450_46%,#124a6e_78%,#0b8f86_130%)] ${
          ehPublico ? 'opacity-90' : ''
        }`}
      />
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-brand-sun-400/20 blur-3xl sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-15%] h-80 w-80 rounded-full bg-brand-teal-400/20 blur-3xl" />

      <div className="relative flex min-h-svh flex-col">
        <Header variante="transparente" titulo={EMPRESA.nome} subtitulo="Simulador Solar" />

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5 pb-10 pt-4 text-center sm:px-8 lg:flex-row lg:items-center lg:gap-14 lg:pt-8 lg:text-left">
          <div className="flex w-full flex-col items-center lg:w-1/2 lg:items-start">
            <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-brand-sun-300 ring-1 ring-white/15">
              <Sparkles size={14} />
              {ehPublico ? 'Simulador oficial Nury Energia' : 'Ferramenta comercial Nury Energia'}
            </span>

            <h1 className="animate-fade-up mt-5 font-display text-[34px] font-extrabold leading-[1.12] tracking-tight text-white [animation-delay:80ms] sm:text-[42px] lg:text-[48px]">
              Descubra quanto você pode{' '}
              <span className="bg-gradient-to-r from-brand-sun-300 via-brand-sun-400 to-brand-teal-300 bg-clip-text text-transparent">
                economizar
              </span>{' '}
              com energia solar.
            </h1>

            <p className="animate-fade-up mt-4 max-w-md text-[16px] leading-relaxed text-white/75 [animation-delay:150ms] sm:text-[17px]">
              {ehPublico
                ? 'Faça uma simulação preliminar em poucos segundos e descubra seu potencial de economia — sem compromisso.'
                : 'Faça uma simulação preliminar em poucos segundos e mostre ao seu cliente o potencial de economia — direto do celular.'}
            </p>

            <div className="animate-fade-up mt-8 flex w-full flex-col items-center gap-3 [animation-delay:220ms] sm:w-auto lg:items-start">
              <button
                type="button"
                onClick={() => navigate(`${basePath}/simulador`)}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-sun-500 to-brand-sun-400 px-8 py-4 text-[16px] font-bold tracking-wide text-brand-navy-900 shadow-glow-sun transition active:scale-[0.98] sm:w-auto"
              >
                COMEÇAR SIMULAÇÃO
                <ArrowRight size={19} className="transition group-hover:translate-x-0.5" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 lg:justify-start">
                {SELOS.map(({ icon: Icon, texto }) => (
                  <div key={texto} className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/70">
                    <Icon size={14} className="text-brand-teal-300" />
                    {texto}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="animate-fade-up relative mt-10 w-full max-w-sm shrink-0 [animation-delay:120ms] lg:mt-0 lg:w-1/2 lg:max-w-none">
            <div className="animate-float">
              <SolarIllustration className="mx-auto h-auto w-full max-w-md drop-shadow-[0_20px_45px_rgba(4,16,28,0.45)]" />
            </div>
          </div>
        </main>

        <footer className="px-5 pb-6 text-center">
          <p className="mx-auto max-w-md text-[11.5px] leading-relaxed text-white/45">
            Simulação preliminar e comercial. O dimensionamento definitivo depende de análise técnica da instalação.
          </p>
        </footer>
      </div>
    </div>
  );
}
