import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  srcMp4: string;
  poster: string;
}

/**
 * Vídeo de fundo em loop para telas comerciais (hero da Home).
 * - Silencioso, autoplay, loop, playsInline (funciona em iOS sem gesto do usuário).
 * - Cai para a imagem `poster` caso o navegador não reproduza vídeo ou o usuário
 *   tenha "prefers-reduced-motion" ativado — nesse caso nem tentamos autoplay.
 * - Fica atrás de um overlay (aplicado pelo componente pai) para manter o
 *   contraste do texto branco.
 */
export function BackgroundVideo({ srcMp4, poster }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const prefereReducirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const video = videoRef.current;
    if (!video || prefereReducirMovimento) return;
    // Setar `muted`/`defaultMuted` só via atributo JSX não é suficiente em vários navegadores
    // mobile (Safari/iOS e alguns WebViews in-app) — a política de autoplay lê a *propriedade*
    // do elemento, e o React nem sempre a inicializa a tempo. Setar explicitamente aqui garante
    // que o autoplay silencioso funcione no celular.
    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {
      // autoplay bloqueado mesmo assim (ex.: modo economia de dados) — o poster permanece visível
    });
  }, []);

  return (
    <video
      ref={videoRef}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      webkit-playsinline="true"
      preload="auto"
      aria-hidden="true"
    >
      <source src={srcMp4} type="video/mp4" />
    </video>
  );
}
