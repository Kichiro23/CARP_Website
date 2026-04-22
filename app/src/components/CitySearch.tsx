import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { BASE_URLS } from '@/config/api';

interface CityResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  admin1?: string;
}

interface CitySearchProps {
  onSelect: (city: { name: string; country: string; lat: number; lng: number }) => void;
  placeholder?: string;
}

export default function CitySearch({ onSelect, placeholder = 'Search any city...' }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URLS.GEOCODE}/search?name=${encodeURIComponent(q.trim())}&count=8&language=en&format=json`);
      if (!res.ok) { setResults([]); setLoading(false); return; }
      const data = await res.json();
      const items = (data.results || []).map((r: any) => ({
        name: r.name,
        country: r.country || r.country_code || '',
        lat: r.latitude,
        lon: r.longitude,
        admin1: r.admin1,
      }));
      setResults(items);
      setOpen(true);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (city: CityResult) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    onSelect({ name: city.name, country: city.country, lat: city.lat, lng: city.lon });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true); }}
          placeholder={placeholder}
          className="glass-input"
          style={{ paddingLeft: 44, paddingRight: 36 }}
          autoComplete="off"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" style={{ color: 'var(--primary)' }} />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-[280px] overflow-y-auto rounded-xl border shadow-2xl" style={{ background: 'rgba(26,26,46,0.98)', backdropFilter: 'blur(24px)', borderColor: 'var(--tile-border)' }}>
          {results.map((city, i) => (
            <button
              key={i}
              onClick={() => handleSelect(city)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>{city.name}</p>
                <p className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-1 rounded-xl border p-4 text-center shadow-2xl" style={{ background: 'rgba(26,26,46,0.98)', borderColor: 'var(--tile-border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No cities found. Try a different name.</p>
        </div>
      )}
    </div>
  );
}
