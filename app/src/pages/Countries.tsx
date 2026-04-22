import { useState, useEffect, useMemo } from 'react';
import { Search, Users, MapPin, RefreshCw } from 'lucide-react';
import { fetchCountries } from '@/services/countriesApi';
import { fetchWeather, wmoEmoji } from '@/services/weatherApi';
import type { CountryData, WeatherData } from '@/types';

export default function Countries() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [weatherCache, setWeatherCache] = useState<Record<string, WeatherData>>({});
  const [weatherLoading, setWeatherLoading] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const data = await fetchCountries();
    setCountries(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return countries;
    const q = query.toLowerCase();
    return countries.filter(c => c.name.toLowerCase().includes(q) || c.capital?.toLowerCase().includes(q));
  }, [countries, query]);

  const loadWeather = async (c: CountryData) => {
    if (weatherCache[c.code] || weatherLoading[c.code]) return;
    setWeatherLoading(p => ({ ...p, [c.code]: true }));
    const w = await fetchWeather(c.lat, c.lon);
    if (w) setWeatherCache(p => ({ ...p, [c.code]: w }));
    setWeatherLoading(p => ({ ...p, [c.code]: false }));
  };

  const toggleExpand = (c: CountryData) => {
    if (expanded === c.code) { setExpanded(null); return; }
    setExpanded(c.code);
    loadWeather(c);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Countries</h1><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Global weather overview</p></div>
        <button onClick={load} className="glass-badge cursor-pointer"><RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh</button>
      </div>
      <div className="mb-4"><div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search countries or capitals..." className="glass-input" style={{ paddingLeft: 44 }} /></div></div>
      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="tile"><div className="skeleton h-4 w-1/3" /></div>)}</div>
      ) : (
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.slice(0, 50).map(c => (
            <div key={c.code}>
              <button onClick={() => toggleExpand(c)} className="tile w-full !p-3 flex items-center gap-3 text-left hover:border-[#EA9D6330] transition-all">
                <img src={c.flag} alt={c.code} className="h-6 w-9 rounded object-cover shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{c.name}</p><p className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><MapPin className="h-2.5 w-2.5 shrink-0" />{c.capital}</p></div>
                <div className="shrink-0 text-right"><p className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}><Users className="h-2.5 w-2.5" />{(c.population / 1e6).toFixed(1)}M</p></div>
              </button>
              {expanded === c.code && (
                <div className="mx-2 -mt-1 rounded-b-xl border border-t-0 p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--tile-border)' }}>
                  {weatherLoading[c.code] ? <div className="skeleton h-4 w-1/2" /> : weatherCache[c.code] ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center"><p className="text-lg">{wmoEmoji(weatherCache[c.code].current.weatherCode)}</p><p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{weatherCache[c.code].current.temperature}C</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Temp</p></div>
                      <div className="text-center"><p className="text-lg">{weatherCache[c.code].current.humidity}%</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Humidity</p></div>
                      <div className="text-center"><p className="text-lg">{weatherCache[c.code].current.windSpeed}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Wind km/h</p></div>
                    </div>
                  ) : <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No weather data</p>}
                </div>
              )}
            </div>
          ))}
          {filtered.length > 50 && <p className="py-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Showing first 50 results. Refine your search.</p>}
        </div>
      )}
    </div>
  );
}
