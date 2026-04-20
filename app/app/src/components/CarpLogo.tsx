interface CarpLogoProps {
  size?: number;
  className?: string;
}

export default function CarpLogo({ size = 48, className = '' }: CarpLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="CARP Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ imageRendering: 'auto' }}
    />
  );
}

export function CarpLogoFull({ height = 40 }: { height?: number }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <CarpLogo size={height} className="shrink-0" />
      <div className="flex flex-col min-w-0 overflow-hidden">
        <span
          className="text-xl font-bold tracking-tight truncate"
          style={{ color: 'var(--primary)', letterSpacing: '-0.02em' }}
        >
          CARP
        </span>
        <span
          className="text-[10px] font-medium tracking-widest uppercase truncate"
          style={{ color: 'var(--text-muted)' }}
        >
          Climate & Air Research
        </span>
      </div>
    </div>
  );
}
