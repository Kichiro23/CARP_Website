import { MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 shrink-0 border-t py-4 text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--tile-border)' }}>
      <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
        <MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />
        CARP <span className="mx-1">&middot;</span> Climate & Air Research Platform <span className="mx-1">&middot;</span> Developed by BSCpE 3C Students 2026 <Heart className="ml-1 inline h-3 w-3 text-red-400" />
      </p>
    </footer>
  );
}
