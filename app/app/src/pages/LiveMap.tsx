import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, RefreshCw, Search, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { fetchWeather, fetchPM25, COUNTRIES, aqiColor } from '@/services/weatherApi';
import type { WeatherCurrent } from '@/types';
import 'leaflet/dist/leaflet.css';

function tempMarker(temp: number, pm: number | null) {
  const c = pm ? aqiColor(pm) : '#888';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${c};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 10px rgba(0,0,0,0.4);color:white;font-size:10px;font-weight:bold;">${Math.round(temp)}&#176;</div>`,
    iconSize: [32, 32], iconAnchor: [16, 16],
  });
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 8, { duration: 1.5 }); }, [lat, lng, map]);
  return null;
}

export default function LiveMap() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [cityData, setCityData] = useState<Record<string, { weather: WeatherCurrent; pm25: number | null }>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

  // Build searchable city index
  const cityIndex = useMemo(() => {
    return COUNTRIES.map(c => ({
      ...c,
      searchStr: `${c.city} ${c.country} ${c.region}`.toLowerCase(),
    }));
  }, []);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return cityIndex.filter(c => c.searchStr.includes(q)).slice(0, 8);
  }, [search, cityIndex]);

  const filtered = useMemo(() => {
    const base = filter === 'All' ? COUNTRIES : COUNTRIES.filter(c => c.region === filter);
    return base;
  }, [filter]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const results: Record<string, { weather: WeatherCurrent; pm25: number | null }> = {};
    // Load in batches to prevent UI freeze
    const toLoad = COUNTRIES;
    const batchSize = 10;
    for (let i = 0; i < toLoad.length; i += batchSize) {
      const batch = toLoad.slice(i, i + batchSize);
      await Promise.all(batch.map(async (c) => {
        const [w, p] = await Promise.all([fetchWeather(c.lat, c.lon), fetchPM25(c.lat, c.lon)]);
        if (w) results[c.city] = { weather: w.current, pm25: p };
      }));
    }
    setCityData(results); setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSearchSelect = (city: typeof COUNTRIES[0]) => {
    setFlyTo([city.lat, city.lon]);
    setSelectedCity(city.city);
    setSearch('');
  };

  const phCities = COUNTRIES.filter(c => c.country === 'Philippines');
  const mapCenter: [number, number] = [15, 110];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Live Map</h1>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{Object.keys(cityData).length} cities monitored globally</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {regions.map(r => (
            <button key={r} onClick={() => setFilter(r)} className={`glass-tab text-[11px] ${filter === r ? 'active' : ''}`}>{r}</button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 tile !py-2 !px-3">
          <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search city or country..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text)' }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setFlyTo(null); }} className="shrink-0" style={{ color: 'var(--text-muted)' }}>
              <X className="h-4 w-4" />
            </button>
          )}
          <button onClick={loadAll} disabled={loading} className="glass-badge cursor-pointer shrink-0" style={{ color: 'var(--text)' }}>
            <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--primary)' }} /> Refresh
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-auto glass-strong shadow-2xl rounded-xl" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--tile-border)' }}>
            {searchResults.map(c => (
              <button key={`${c.city}-${c.country}`} onClick={() => handleSearchSelect(c)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--primary)]/10 transition-colors border-b last:border-0" style={{ borderColor: 'var(--tile-border)' }}>
                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{c.city}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{c.country} &middot; {c.region}</p>
                </div>
                <span className="text-[10px] glass-badge shrink-0">{cityData[c.city] ? `${cityData[c.city].weather.temperature}C` : '...'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Philippine Cities Quick Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 py-1.5" style={{ color: 'var(--primary)' }}>Philippines:</span>
        {phCities.slice(0, 10).map(c => (
          <button key={c.city} onClick={() => handleSearchSelect(c)}
            className={`glass-tab text-[10px] shrink-0 ${selectedCity === c.city ? 'active' : ''}`}
            style={selectedCity === c.city ? { color: 'var(--primary)', background: 'rgba(234,157,99,0.1)', borderColor: 'rgba(234,157,99,0.2)' } : {}}>
            {c.city}
          </button>
        ))}
      </div>

      {loading && Object.keys(cityData).length === 0 ? (
        <div className="flex h-[50vh] items-center justify-center tile">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
          {/* Map */}
          <div className="tile !p-0 overflow-hidden" style={{ height: '60vh', minHeight: '400px' }}>
            <MapContainer center={mapCenter} zoom={3} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
              {flyTo && <MapFlyTo lat={flyTo[0]} lng={flyTo[1]} />}
              <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url={isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'} />
              {filtered.map(c => {
                const d = cityData[c.city]; if (!d) return null;
                return (
                  <Marker key={c.city} position={[c.lat, c.lon]} icon={tempMarker(d.weather.temperature, d.pm25)}>
                    <Popup>
                      <div className="min-w-[200px] p-2">
                        <p className="font-bold text-base" style={{ color: '#EA9D63' }}>{c.city}</p>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{c.country} &middot; {c.region}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="rounded-lg p-2" style={{ background: 'rgba(234,157,99,0.08)' }}>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Temperature</p>
                            <p className="font-bold text-lg" style={{ color: '#EA9D63' }}>{d.weather.temperature}C</p>
                          </div>
                          <div className="rounded-lg p-2" style={{ background: 'rgba(59,130,246,0.08)' }}>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Humidity</p>
                            <p className="font-bold text-lg" style={{ color: '#3b82f6' }}>{d.weather.humidity}%</p>
                          </div>
                          <div className="rounded-lg p-2" style={{ background: 'rgba(16,185,129,0.08)' }}>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Wind</p>
                            <p className="font-bold" style={{ color: '#10b981' }}>{d.weather.windSpeed} km/h</p>
                          </div>
                          <div className="rounded-lg p-2" style={{ background: d.pm25 ? `${aqiColor(d.pm25)}15` : 'rgba(255,255,255,0.03)' }}>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>PM2.5</p>
                            <p className="font-bold" style={{ color: d.pm25 ? aqiColor(d.pm25) : 'var(--text-muted)' }}>{d.pm25 ?? 'N/A'}</p>
                          </div>
                        </div>
                        <div className="rounded-lg p-2 text-[10px]" style={{ background: 'rgba(234,157,99,0.05)', border: '1px solid rgba(234,157,99,0.15)' }}>
                          <p className="font-bold" style={{ color: '#EA9D63' }}>AI Insight</p>
                          <p style={{ color: 'var(--text-secondary)' }}>
                            {d.weather.temperature > 30 ? 'Hot conditions. Stay hydrated.' :
                             d.weather.temperature > 20 ? 'Pleasant weather. Good for outdoor activities.' :
                             d.weather.temperature > 10 ? 'Cool weather. Bring a jacket.' :
                             'Cold conditions. Dress warmly.'}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            <div className="tile">
              <h3 className="tile-title">City Data ({filtered.filter(c => cityData[c.city]).length})</h3>
              {filtered.filter(c => cityData[c.city]).slice(0, 20).map(c => {
                const d = cityData[c.city]; if (!d) return null;
                const isSel = selectedCity === c.city;
                return (
                  <button key={c.city} onClick={() => handleSearchSelect(c)} className={`flex w-full items-center justify-between py-2 border-b last:border-0 text-left transition-colors rounded-lg px-2 ${isSel ? 'bg-[var(--primary)]/10' : 'hover:bg-[var(--primary)]/5'}`} style={{ borderColor: 'var(--tile-border)' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-3 w-3 shrink-0" style={{ color: isSel ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <div className="min-w-0"><span className={`text-xs font-medium truncate block ${isSel ? 'text-[var(--primary)]' : ''}`} style={{ color: isSel ? undefined : 'var(--text)' }}>{c.city}</span><span className="text-[10px] truncate block" style={{ color: 'var(--text-muted)' }}>{c.country}</span></div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{d.weather.temperature}C</span>
                      {d.pm25 !== null && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: aqiColor(d.pm25) + '20', color: aqiColor(d.pm25) }}>{d.pm25}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="tile">
              <h3 className="tile-title">AQI Legend</h3>
              {[
                { label: 'Good', color: '#5CB85C', range: '0-12' },
                { label: 'Moderate', color: '#F0AD4E', range: '12-35' },
                { label: 'Unhealthy (SG)', color: '#E87040', range: '35-55' },
                { label: 'Unhealthy', color: '#D9534F', range: '55-150' },
                { label: 'Very Unhealthy', color: '#9B59B6', range: '150+' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 py-1">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>{item.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
