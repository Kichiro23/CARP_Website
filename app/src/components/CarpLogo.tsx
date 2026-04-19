interface CarpLogoProps {
  size?: number;
  className?: string;
}

export default function CarpLogo({ size = 48, className = '' }: CarpLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#EA9D63" />
          <stop offset="100%" stopColor="#d48952" />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#A2B7C7" />
          <stop offset="100%" stopColor="#7a9ab0" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none" opacity="0.9" />
      <ellipse cx="32" cy="32" rx="14" ry="24" stroke="url(#logoGrad2)" strokeWidth="0.8" fill="none" opacity="0.3" />
      <ellipse cx="32" cy="32" rx="24" ry="14" stroke="url(#logoGrad2)" strokeWidth="0.8" fill="none" opacity="0.3" />
      <line x1="32" y1="2" x2="32" y2="62" stroke="url(#logoGrad2)" strokeWidth="0.6" opacity="0.2" />
      <line x1="2" y1="32" x2="62" y2="32" stroke="url(#logoGrad2)" strokeWidth="0.6" opacity="0.2" />
      <circle cx="32" cy="32" r="4" fill="url(#logoGrad)" />
      <circle cx="32" cy="8" r="2" fill="url(#logoGrad)" opacity="0.8" />
      <circle cx="32" cy="56" r="2" fill="url(#logoGrad)" opacity="0.8" />
      <circle cx="8" cy="32" r="2" fill="url(#logoGrad)" opacity="0.8" />
      <circle cx="56" cy="32" r="2" fill="url(#logoGrad)" opacity="0.8" />
      <circle cx="50" cy="14" r="1.2" fill="url(#logoGrad2)" opacity="0.5" />
      <circle cx="14" cy="50" r="1.2" fill="url(#logoGrad2)" opacity="0.5" />
    </svg>
  );
}

export function CarpLogoFull({ height = 40 }: { height?: number }) {
  return (
    <div className="flex items-center gap-3">
      <CarpLogo size={height} />
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          CARP
        </span>
        <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Climate & Air Research
        </span>
      </div>
    </div>
  );
}
