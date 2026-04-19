import { useState, useEffect } from 'react';
import { GitCompare, Thermometer, Droplets, Wind, Sun, MapPin } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { fetchWeather, geocodeCity } from '@/services/weatherApi';
import type { WeatherData } from '@/types';
import { Bar } from 'react-chartjs-2';
import '@/lib/chart';

export default function Compare() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [cityA, setCityA] = useState('Manila');
  const [cityB, setCityB] = useState('Tokyo');
  const [dataA, setDataA] = useState<WeatherData | null>(null);
  const [dataB, setDataB] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const compare = async () => {
    setLoading(true); setError('');
    const [gA, gB] = await Promise.all([geocodeCity(cityA), geocodeCity(cityB)]);
    if (!gA || !gB) { setError('City not found'); setLoading(false); return; }
    const [wA, wB] = await Promise.all([fetchWeather(gA.lat, gA.lon), fetchWeather(gB.lat, gB.lon)]);
    setDataA(wA); setDataB(wB);
    if (!wA || !wB) setError('Failed to load data');
    setLoading(false);
  };
  useEffect(() => { compare(); }, []);

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: isDark ? '#9a9da8' : '#5a5d6b', font: { size: 11 } } } },
    scales: { x: { ticks: { color: isDark ? '#9a9da8' : '#5a5d6b' }, grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } }, y: { ticks: { color: isDark ? '#9a9da8' : '#5a5d6b' }, grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } } },
  };

  const metrics = dataA && dataB ? [
    { label: 'Temperature (C)', icon: Thermometer, values: [dataA.current.temperature, dataB.current.temperature], color: '#EA9D63' },
    { label: 'Humidity (%)', icon: Droplets, values: [dataA.current.humidity, dataB.current.humidity], color: '#3b82f6' },
    { label: 'Wind (km/h)', icon: Wind, values: [dataA.current.windSpeed, dataB.current.windSpeed], color: '#10b981' },
    { label: 'UV Index', icon: Sun, values: [dataA.current.uvIndex, dataB.current.uvIndex], color: '#f59e0b' },
  ] : [];

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Compare</h1><p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Compare weather between two cities</p></div>

      <div className="tile flex flex-col items-end gap-3 sm:flex-row">
        <div className="flex-1 w-full">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>City A</label>
          <div className="relative"><MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--primary)' }} />
            <input type="text" value={cityA} onChange={e => setCityA(e.target.value)} className="glass-input pl-11" /></div>
        </div>
        <div className="flex h-11 items-center"><GitCompare className="h-5 w-5" style={{ color: 'var(--primary)' }} /></div>
        <div className="flex-1 w-full">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>City B</label>
          <div className="relative"><MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
            <input type="text" value={cityB} onChange={e => setCityB(e.target.value)} className="glass-input pl-11" /></div>
        </div>
        <button onClick={compare} disabled={loading} className="glass-btn flex h-11 items-center gap-2 px-6 text-sm w-full sm:w-auto">
          {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <GitCompare className="h-4 w-4" />} Compare
        </button>
      </div>

      {error && <div className="tile text-red-400 text-center text-sm py-3">{error}</div>}

      {dataA && dataB && (
        <>
          <div className="grid-tiles-2">
            {[{ label: cityA, data: dataA, color: '#EA9D63' }, { label: cityB, data: dataB, color: '#A2B7C7' }].map(c => (
              <div key={c.label} className="tile" style={{ borderColor: c.color + '30' }}>
                <h3 className="mb-4 text-base font-bold truncate" style={{ color: c.color }}>{c.label}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[{ l: 'Temp', v: `${c.data.current.temperature}C`, color: '#EA9D63' }, { l: 'Humidity', v: `${c.data.current.humidity}%`, color: '#3b82f6' }, { l: 'Wind', v: `${c.data.current.windSpeed} km/h`, color: '#10b981' }, { l: 'UV', v: `${c.data.current.uvIndex}`, color: '#f59e0b' }].map(item => (
                    <div key={item.l} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <p className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>{item.l}</p>
                      <p className="mt-1 text-base font-bold" style={{ color: 'var(--text)' }}>{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="tile">
            <h3 className="tile-title">Comparison Chart</h3>
            <div className="h-[220px]">
              <Bar data={{
                labels: metrics.map(m => m.label),
                datasets: [
                  { label: cityA, data: metrics.map(m => m.values[0]), backgroundColor: '#EA9D6370', borderColor: '#EA9D63', borderWidth: 1, borderRadius: 5 },
                  { label: cityB, data: metrics.map(m => m.values[1]), backgroundColor: '#A2B7C770', borderColor: '#A2B7C7', borderWidth: 1, borderRadius: 5 },
                ]
              }} options={chartOpts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
