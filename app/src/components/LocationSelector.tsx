import { useState, useRef, useEffect } from 'react';
import { MapPin, Check, Star, ChevronDown } from 'lucide-react';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props {
  locations: SavedLocation[];
  current: SavedLocation;
  onSelect: (loc: SavedLocation) => void;
}

export default function LocationSelector({ locations, current, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="glass-badge cursor-pointer hover:bg-white/8"
      >
        <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
        <span className="truncate max-w-[120px] inline-block">{current.name}</span>
        <span className="mx-1" style={{ color: 'var(--text-muted)' }}>,</span>
        <span className="truncate max-w-[80px] inline-block" style={{ color: 'var(--text-muted)' }}>{current.country}</span>
        <ChevronDown className="ml-1.5 h-3 w-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border shadow-2xl overflow-hidden" style={{ background: 'rgba(26,26,46,0.98)', backdropFilter: 'blur(24px)', borderColor: 'var(--tile-border)' }}>
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--tile-border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Saved Locations</p>
          </div>
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => { onSelect(loc); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              {current.id === loc.id ? (
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
              ) : (
                <div className="h-3.5 w-3.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold" style={{ color: 'var(--text)' }}>{loc.name}</p>
                <p className="truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>{loc.country}</p>
              </div>
              {loc.isDefault && <Star className="h-3 w-3 shrink-0" style={{ color: 'var(--primary)' }} />}
            </button>
          ))}
          {locations.length === 0 && (
            <p className="px-3 py-3 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>No saved locations</p>
          )}
        </div>
      )}
    </div>
  );
}
