import { useEffect, useRef, useState } from 'react';

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Anima um número de 0 até `valorFinal` com easing suave. Usado nos cards de resultado. */
export function useCountUp(valorFinal: number, duracaoMs = 900, delayMs = 0): number {
  const [valor, setValor] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let inicio: number | null = null;
    let cancelado = false;

    const passo = (timestamp: number) => {
      if (cancelado) return;
      if (inicio === null) inicio = timestamp;
      const decorrido = timestamp - inicio;
      const progresso = Math.min(decorrido / duracaoMs, 1);
      setValor(valorFinal * easeOutExpo(progresso));
      if (progresso < 1) {
        frameRef.current = requestAnimationFrame(passo);
      }
    };

    const timeout = setTimeout(() => {
      frameRef.current = requestAnimationFrame(passo);
    }, delayMs);

    return () => {
      cancelado = true;
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorFinal, duracaoMs, delayMs]);

  return valor;
}
