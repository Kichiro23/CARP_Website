import { useState, useRef, useEffect } from 'react';
import { MapPin, Check, Star, ChevronDown, Search } from 'lucide-react';
import { POPULAR_CITIES } from '@/config/api';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props {
  locations: SavedLocation[];
  current: SavedLocation;
  onSelect: (loc: SavedLocation) => void;
}

export default function LocationSelector({ locations, current, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  const handleSelect = (loc: SavedLocation) => {
    onSelect(loc);
    setOpen(false);
    setSearch('');
  };

  const filteredPopular = search.trim()
    ? POPULAR_CITIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_CITIES;

  const filteredSaved = search.trim()
    ? locations.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.country.toLowerCase().includes(search.toLowerCase())
      )
    : locations;

  const isCurrent = (loc: { name: string; country: string }) =>
    current.name === loc.name && current.country === loc.country;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="glass-badge cursor-pointer hover:bg-white/10 active:scale-95 transition-transform"
        style={{ position: 'relative', zIndex: open ? 60 : 10 }}
      >
        <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
        <span className="truncate max-w-[120px] inline-block">{current.name}</span>
        <span className="mx-1" style={{ color: 'var(--text-muted)' }}>,</span>
        <span className="truncate max-w-[80px] inline-block" style={{ color: 'var(--text-muted)' }}>{current.country}</span>
        <ChevronDown className={`ml-1.5 h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-[55] mt-2 w-72 rounded-xl border shadow-2xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(24px)', borderColor: 'var(--tile-border)' }}
        >
          {/* Search */}
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--tile-border)' }}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cities..."
                className="w-full rounded-lg py-1.5 pl-7 pr-2 text-[11px] outline-none"
                style={{ background: 'var(--tile-bg)', color: 'var(--text)', border: '1px solid var(--tile-border)' }}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {/* Saved Locations */}
            {filteredSaved.length > 0 && (
              <>
                <div className="px-3 py-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Saved Locations</p>
                </div>
                {filteredSaved.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(loc)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/5"
                  >
                    {isCurrent(loc) ? (
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                    ) : (
                      <div className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="truncate text-xs font-semibold" style={{ color: 'var(--text)' }}>{loc.name}</p>
                      <p className="truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>{loc.country}</p>
                    </div>
                    {loc.isDefault && <Star className="h-3 w-3 shrink-0" style={{ color: 'var(--primary)' }} />}
                  </button>
                ))}
              </>
            )}

            {/* Popular Cities */}
            {filteredPopular.length > 0 && (
              <>
                <div className="px-3 py-1.5 border-t" style={{ borderColor: 'var(--tile-border)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Popular Cities</p>
                </div>
                {filteredPopular.map(city => {
                  const savedLoc = locations.find(l => l.name === city.name && l.country === city.country);
                  const loc = savedLoc || { id: `pop-${city.name}`, ...city, isDefault: false };
                  return (
                    <button
                      key={city.name}
                      onClick={() => handleSelect(loc)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/5"
                    >
                      {isCurrent(city) ? (
                        <Check className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                      ) : (
                        <div className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <p className="truncate text-xs font-semibold" style={{ color: 'var(--text)' }}>{city.name}</p>
                        <p className="truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>{city.country}</p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {filteredSaved.length === 0 && filteredPopular.length === 0 && (
              <p className="px-3 py-3 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>No cities found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
