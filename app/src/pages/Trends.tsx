import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, MapPin } from 'lucide-react';
import { fetchWeather } from '@/services/weatherApi';
import { Line } from 'react-chartjs-2';
import type { WeatherData } from '@/types';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props { current: SavedLocation; }

export default function Trends({ current }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const w = await fetchWeather(current.lat, current.lng);
    setWeather(w);
    if (!w) setError('Could not load data.');
    setLoading(false);
  };
  useEffect(() => { load(); }, [current.lat, current.lng]);

  const cOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#9a9da8', font: { size: 10 }, boxWidth: 10 } } },
    scales: { x: { ticks: { color: '#9a9da8', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
              y: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } } } };

  if (loading) return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Trends</h1><div className="skeleton mt-1 h-4 w-48" /></div>
      <div className="space-y-4">{[1,2].map(i => <div key={i} className="tile"><div className="skeleton h-[200px] w-full" /></div>)}</div>
    </div>
  );

  if (error || !weather) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error || 'No data available'}</p>
      <button onClick={load} className="glass-btn px-4 py-2 text-xs">Retry</button>
    </div>
  );

  const hourly = weather.hourly.slice(0, 48);
  const daily = weather.daily.slice(0, 14);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Trends</h1><p className="text-xs" style={{ color: 'var(--text-secondary)' }}><MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />{current.name}, {current.country}</p></div>
        <button onClick={load} className="glass-badge cursor-pointer"><RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh</button>
      </div>

      <div className="tile">
        <div className="mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" style={{ color: 'var(--primary)' }} /><h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>48-Hour Temperature Trend</h3></div>
        <div className="h-[200px]">
          <Line data={{ labels: hourly.map(h => h.time.slice(11, 16)),
            datasets: [
              { label: 'Temp C', data: hourly.map(h => h.temperature), borderColor: '#EA9D63', backgroundColor: '#EA9D6312', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 },
              { label: 'Precip %', data: hourly.map(h => h.precipitationProbability), borderColor: '#3b82f6', backgroundColor: '#3b82f612', borderWidth: 1.5, fill: false, tension: 0.4, pointRadius: 0, borderDash: [4, 4] },
            ] }} options={cOpts} />
        </div>
      </div>

      <div className="tile">
        <div className="mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-400" /><h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-400">14-Day Temperature Outlook</h3></div>
        <div className="h-[200px]">
          <Line data={{ labels: daily.map(d => new Date(d.time).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
            datasets: [
              { label: 'High', data: daily.map(d => d.maxTemp), borderColor: '#EA9D63', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3, pointRadius: 2 },
              { label: 'Low', data: daily.map(d => d.minTemp), borderColor: '#3b82f6', backgroundColor: 'transparent', borderWidth: 2, tension: 0.3, pointRadius: 2 },
            ] }} options={cOpts} />
        </div>
      </div>

      <div className="grid-tiles-2">
        <div className="tile">
          <h3 className="tile-title">Temperature Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Highest (7d)</span><span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{Math.max(...weather.daily.slice(0,7).map(d => d.maxTemp))}C</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Lowest (7d)</span><span className="text-xs font-bold text-blue-400">{Math.min(...weather.daily.slice(0,7).map(d => d.minTemp))}C</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Average High</span><span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{(weather.daily.slice(0,7).reduce((s,d) => s+d.maxTemp,0)/7).toFixed(1)}C</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Average Low</span><span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{(weather.daily.slice(0,7).reduce((s,d) => s+d.minTemp,0)/7).toFixed(1)}C</span></div>
            <div className="flex justify-between"><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Temp Range</span><span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{(Math.max(...weather.daily.slice(0,7).map(d => d.maxTemp)) - Math.min(...weather.daily.slice(0,7).map(d => d.minTemp))).toFixed(1)}C</span></div>
          </div>
        </div>
        <div className="tile">
          <h3 className="tile-title">Rain Probability (7d)</h3>
          <div className="space-y-2">
            {weather.daily.slice(0,7).map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-8 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{new Date(d.time).toLocaleDateString('en', { weekday: 'short' })}</span>
                <div className="h-2 flex-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${d.precipitationProbability}%`, background: d.precipitationProbability > 50 ? '#3b82f6' : '#A2B7C7' }} />
                </div>
                <span className="w-8 text-right text-[10px] font-bold" style={{ color: d.precipitationProbability > 50 ? '#3b82f6' : 'var(--text-muted)' }}>{d.precipitationProbability}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
