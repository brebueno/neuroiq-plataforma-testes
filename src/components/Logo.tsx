// QIMind logo — lupa (descoberta) + ponto âmbar (o insight/recompensa) + wordmark.
// Assets originais em Downloads/QIMind-design/logo. Inline p/ escalar via className.

export function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 56" className={className} fill="none" role="img" aria-label="QIMind">
      <g transform="translate(6,8)">
        <circle cx="18" cy="18" r="12.5" stroke="#12203B" strokeWidth="3.4" fill="none" />
        <line x1="25.5" y1="25.5" x2="34" y2="34" stroke="#12203B" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="34.5" cy="34.5" r="3" fill="#E0A93B" />
      </g>
      <text x="62" y="38" fontFamily="Figtree, system-ui, sans-serif" fontSize="34" fontWeight="800" letterSpacing="-1" fill="#12203B">
        QI<tspan fill="#12A08C">Mind</tspan>
      </text>
    </svg>
  );
}

export function LogoIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" role="img" aria-label="QIMind">
      <circle cx="18" cy="18" r="12.5" stroke="#12A08C" strokeWidth="3.4" fill="none" />
      <line x1="25.5" y1="25.5" x2="34" y2="34" stroke="#12A08C" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="34.5" cy="34.5" r="3" fill="#E0A93B" />
    </svg>
  );
}
