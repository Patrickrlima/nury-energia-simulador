/**
 * Ilustração vetorial original (casa + painéis solares + sol), criada do zero
 * para a identidade da Nury Energia — nenhum asset de terceiros é usado aqui.
 */
export function SolarIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustração de casa com painéis solares e sol"
    >
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fdd873" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fdd873" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sunBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdd873" />
          <stop offset="100%" stopColor="#f6a821" />
        </linearGradient>
        <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#124a6e" />
          <stop offset="100%" stopColor="#0b8f86" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d3450" />
          <stop offset="100%" stopColor="#082032" />
        </linearGradient>
      </defs>

      <circle cx="320" cy="70" r="70" fill="url(#sunGlow)" />
      <circle cx="320" cy="70" r="34" fill="url(#sunBody)" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 320 + Math.cos(angle) * 46;
        const y1 = 70 + Math.sin(angle) * 46;
        const x2 = 320 + Math.cos(angle) * 58;
        const y2 = 70 + Math.sin(angle) * 58;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fdd873" strokeWidth="4" strokeLinecap="round" />
        );
      })}

      {/* casa */}
      <rect x="40" y="190" width="220" height="110" rx="6" fill="#f3f8fb" opacity="0.08" />
      <path d="M40 190 L150 120 L260 190 Z" fill="url(#roofGrad)" />
      <rect x="55" y="190" width="190" height="100" rx="4" fill="#0d3450" opacity="0.55" />
      <rect x="130" y="230" width="40" height="60" rx="3" fill="#082032" />
      <rect x="75" y="210" width="30" height="30" rx="3" fill="#7fe8d8" opacity="0.35" />
      <rect x="195" y="210" width="30" height="30" rx="3" fill="#7fe8d8" opacity="0.35" />

      {/* painéis no telhado */}
      <g transform="translate(60 128) rotate(-18)">
        {[0, 1, 2, 3].map((col) => (
          <rect key={col} x={col * 27} y="0" width="24" height="46" rx="2" fill="url(#panelGrad)" stroke="#7fe8d8" strokeOpacity="0.4" />
        ))}
      </g>

      {/* raio de energia */}
      <path
        d="M150 150 L138 178 L152 178 L134 214 L166 172 L152 172 Z"
        fill="#fdd873"
        stroke="#f6a821"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* base / chão */}
      <ellipse cx="150" cy="304" rx="170" ry="10" fill="#082032" opacity="0.15" />
    </svg>
  );
}
