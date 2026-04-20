export default function Footer() {
  return (
    <footer
      className="shrink-0 py-4 px-6 md:px-10"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        borderTop: '1px solid var(--glass-border)',
        borderRadius: '16px 16px 0 0',
      }}
    >
      <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-2">
        <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          CARP &ndash; Climate &amp; Air Research Platform
        </span>
        <span className="hidden sm:inline text-[11px]" style={{ color: 'var(--text-muted)' }}>&middot;</span>
        <span className="text-[10px] font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Developed by BSCpE 3C Students 2026
        </span>
      </div>
    </footer>
  );
}
