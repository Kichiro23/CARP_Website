import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, MapPin } from 'lucide-react';
import { fetchWeather, fetchPM25, wmoEmoji } from '@/services/weatherApi';
import { Bar, Doughnut } from 'react-chartjs-2';
import type { WeatherData } from '@/types';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props { current: SavedLocation; }

export default function Analytics({ current }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [pm25, setPm25] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [w, p] = await Promise.all([
        fetchWeather(current.lat, current.lng),
        fetchPM25(current.lat, current.lng),
      ]);
      setWeather(w); setPm25(p);
      if (!w) setError('Could not load data.');
    } catch { setError('Failed to load data.'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [current.lat, current.lng]);

  const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
              y: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } } } };

  const weatherConditionCounts = () => {
    if (!weather) return [0, 0, 0, 0];
    const codes = weather.daily.map(d => d.weatherCode);
    return [codes.filter(c => c <= 1).length, codes.filter(c => c >= 2 && c <= 48).length, codes.filter(c => c >= 51 && c <= 82).length, codes.filter(c => c >= 95).length];
  };

  if (loading) return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Analytics</h1><div className="skeleton mt-1 h-4 w-48" /></div>
      <div className="grid-tiles-2">{[1,2,3,4].map(i => <div key={i} className="tile"><div className="skeleton h-[160px] w-full" /></div>)}</div>
    </div>
  );

  if (error || !weather) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error || 'No data available'}</p>
      <button onClick={load} className="glass-btn px-4 py-2 text-xs">Retry</button>
    </div>
  );

  const temps = weather.daily.slice(0, 7);
  const conditionCounts = weatherConditionCounts();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Analytics</h1><p className="text-xs" style={{ color: 'var(--text-secondary)' }}><MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />{current.name}, {current.country}</p></div>
        <button onClick={load} className="glass-badge cursor-pointer"><RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh</button>
      </div>

      <div className="grid-tiles-4">
        <div className="tile text-center"><BarChart3 className="mx-auto mb-1 h-5 w-5" style={{ color: 'var(--primary)' }} /><p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{weather.current.temperature}C</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Current</p></div>
        <div className="tile text-center"><p className="text-xl font-bold text-blue-400">{weather.current.humidity}%</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Humidity</p></div>
        <div className="tile text-center"><p className="text-xl font-bold text-emerald-400">{weather.current.windSpeed}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Wind km/h</p></div>
        <div className="tile text-center"><p className="text-xl font-bold" style={{ color: pm25 !== null ? (pm25 <= 35 ? '#5CB85C' : '#F0AD4E') : 'var(--text-muted)' }}>{pm25 ?? '--'}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>PM2.5</p></div>
      </div>

      <div className="grid-tiles-2">
        <div className="tile">
          <h3 className="tile-title">7-Day Temperature Range</h3>
          <div className="h-[180px]">
            <Bar data={{ labels: temps.map(t => new Date(t.time).toLocaleDateString('en', { weekday: 'short' })),
              datasets: [
                { label: 'Max', data: temps.map(t => t.maxTemp), backgroundColor: '#EA9D6390', borderRadius: 6, borderSkipped: false as any },
                { label: 'Min', data: temps.map(t => t.minTemp), backgroundColor: '#3b82f690', borderRadius: 6, borderSkipped: false as any },
              ] }} options={{ ...barOpts, plugins: { legend: { display: true, labels: { color: '#9a9da8', font: { size: 10 } } } } }} />
          </div>
        </div>
        <div className="tile">
          <h3 className="tile-title">Weather Conditions (7 Days)</h3>
          <div className="mx-auto h-[180px] max-w-[200px]">
            <Doughnut data={{ labels: ['Clear', 'Cloudy', 'Rain', 'Storm'],
              datasets: [{ data: conditionCounts, backgroundColor: ['#F0AD4E', '#A2B7C7', '#3b82f6', '#9B59B6'], borderWidth: 0, hoverOffset: 4 }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9a9da8', font: { size: 10 }, padding: 10 } } } }} />
          </div>
        </div>
      </div>

      <div className="tile">
        <h3 className="tile-title">Weekly Forecast Summary</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {weather.daily.slice(0, 7).map((d, i) => (
            <div key={i} className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>{new Date(d.time).toLocaleDateString('en', { weekday: 'short' })}</p>
              <p className="my-1 text-xl">{wmoEmoji(d.weatherCode)}</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{d.maxTemp}C</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.precipitationProbability}% rain</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
