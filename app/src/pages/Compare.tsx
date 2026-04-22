import { useState } from 'react';
import { Search, GitCompare, Thermometer, Droplets, Wind, AlertTriangle, Sun, Sunrise, CloudRain } from 'lucide-react';
import { geocodeCity, fetchWeather, fetchPM25, wmoEmoji, wmoLabel, aqiColor } from '@/services/weatherApi';
import type { WeatherData } from '@/types';

interface CityData { name: string; country: string; weather: WeatherData; pm25: number | null; }

export default function Compare() {
  const [cityA, setCityA] = useState('');
  const [cityB, setCityB] = useState('');
  const [dataA, setDataA] = useState<CityData | null>(null);
  const [dataB, setDataB] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const compare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setDataA(null); setDataB(null);
    if (!cityA.trim() || !cityB.trim()) { setError('Enter both cities'); return; }
    setLoading(true);
    try {
      const [geoA, geoB] = await Promise.all([geocodeCity(cityA), geocodeCity(cityB)]);
      if (!geoA) { setError(`Could not find city: ${cityA}`); setLoading(false); return; }
      if (!geoB) { setError(`Could not find city: ${cityB}`); setLoading(false); return; }
      const [wA, wB, pA, pB] = await Promise.all([
        fetchWeather(geoA.lat, geoA.lon), fetchWeather(geoB.lat, geoB.lon),
        fetchPM25(geoA.lat, geoA.lon), fetchPM25(geoB.lat, geoB.lon),
      ]);
      if (wA) setDataA({ name: geoA.name, country: geoA.country, weather: wA, pm25: pA });
      if (wB) setDataB({ name: geoB.name, country: geoB.country, weather: wB, pm25: pB });
    } catch { setError('Failed to fetch data.'); }
    setLoading(false);
  };

  const StatRow = ({ icon: Icon, label, aVal, bVal, unit, colorize }: { icon: any; label: string; aVal: string | number; bVal: string | number; unit?: string; colorize?: boolean }) => {
    const a = Number(aVal) || 0; const b = Number(bVal) || 0;
    const diff = a - b;
    return (
      <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--tile-border)' }}>
        <div className="flex items-center gap-2 flex-1"><Icon className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} /><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span></div>
        <div className="flex items-center gap-6">
          <span className={`text-right text-xs font-bold w-16 ${colorize && aVal !== '--' ? '' : ''}`} style={{ color: colorize ? (typeof aVal === 'number' ? aqiColor(aVal) : 'var(--text)') : 'var(--text)' }}>{aVal}{unit}</span>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: diff > 0 ? 'rgba(234,157,99,0.15)' : 'rgba(59,130,246,0.15)', color: diff > 0 ? '#EA9D63' : '#3b82f6' }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}</div>
          <span className={`text-right text-xs font-bold w-16`} style={{ color: colorize ? (typeof bVal === 'number' ? aqiColor(bVal) : 'var(--text)') : 'var(--text)' }}>{bVal}{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Compare Cities</h1><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Side-by-side weather comparison with real data</p></div>
      <form onSubmit={compare} className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input type="text" value={cityA} onChange={e => setCityA(e.target.value)} placeholder="City A (e.g. Manila)" className="glass-input" style={{ paddingLeft: 44 }} /></div>
          <div className="relative"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input type="text" value={cityB} onChange={e => setCityB(e.target.value)} placeholder="City B (e.g. Tokyo)" className="glass-input" style={{ paddingLeft: 44 }} /></div>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="glass-btn mt-3 w-full justify-center py-3">
          <GitCompare className="h-4 w-4" /> {loading ? 'Loading...' : 'Compare'}
        </button>
      </form>

      {dataA && dataB && (
        <>
          <div className="tile">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-center flex-1"><h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{dataA.name}</h3><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{dataA.country}</p><p className="mt-1 text-2xl">{wmoEmoji(dataA.weather.current.weatherCode)}</p></div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}><GitCompare className="h-4 w-4" style={{ color: 'var(--primary)' }} /></div>
              <div className="text-center flex-1"><h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{dataB.name}</h3><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{dataB.country}</p><p className="mt-1 text-2xl">{wmoEmoji(dataB.weather.current.weatherCode)}</p></div>
            </div>
            <StatRow icon={Thermometer} label="Temperature" aVal={dataA.weather.current.temperature} bVal={dataB.weather.current.temperature} unit="C" />
            <StatRow icon={Droplets} label="Humidity" aVal={dataA.weather.current.humidity} bVal={dataB.weather.current.humidity} unit="%" />
            <StatRow icon={Wind} label="Wind Speed" aVal={dataA.weather.current.windSpeed} bVal={dataB.weather.current.windSpeed} unit=" km/h" />
            <StatRow icon={Sun} label="UV Index" aVal={dataA.weather.current.uvIndex} bVal={dataB.weather.current.uvIndex} />
            <StatRow icon={CloudRain} label="Precipitation %" aVal={dataA.weather.daily[0]?.precipitationProbability ?? 0} bVal={dataB.weather.daily[0]?.precipitationProbability ?? 0} unit="%" />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 flex-1"><AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} /><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>PM2.5</span></div>
              <div className="flex items-center gap-6">
                <span className="w-16 text-right text-xs font-bold" style={{ color: dataA.pm25 !== null ? aqiColor(dataA.pm25) : 'var(--text-muted)' }}>{dataA.pm25 ?? '--'}</span>
                <div className="h-6 w-6" />
                <span className="w-16 text-right text-xs font-bold" style={{ color: dataB.pm25 !== null ? aqiColor(dataB.pm25) : 'var(--text-muted)' }}>{dataB.pm25 ?? '--'}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{wmoLabel(dataA.weather.current.weatherCode)}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{wmoLabel(dataB.weather.current.weatherCode)}</span>
            </div>
          </div>

          {/* 7-day forecast comparison */}
          <div className="tile">
            <h3 className="tile-title mb-3">7-Day Forecast</h3>
            <div className="grid grid-cols-7 gap-1">
              {dataA.weather.daily.slice(0, 7).map((d, i) => {
                const date = new Date(d.time);
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return (
                  <div key={i} className="text-center rounded-lg border p-2" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-[9px] font-bold" style={{ color: 'var(--primary)' }}>{days[date.getDay()]}</p>
                    <p className="text-sm my-0.5">{wmoEmoji(d.weatherCode)}</p>
                    <p className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>{d.maxTemp}°</p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{d.minTemp}°</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Winner card */}
          <div className="tile text-center">
            <Sunrise className="mx-auto mb-2 h-6 w-6" style={{ color: 'var(--primary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {dataA.weather.current.temperature > dataB.weather.current.temperature
                ? `${dataA.name} is currently warmer`
                : `${dataB.name} is currently warmer`}
              {' by '}
              {Math.abs(dataA.weather.current.temperature - dataB.weather.current.temperature).toFixed(1)}°C
            </p>
          </div>
        </>
      )}
    </div>
  );
}
