import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, MapPin, Info, Thermometer, Droplets, Wind, CloudRain, Sun, Cloud, CloudLightning } from 'lucide-react';
import { fetchWeather, fetchPM25, wmoEmoji, wmoDescription } from '@/services/weatherApi';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(19,19,31,0.95)',
        titleColor: '#EA9D63',
        bodyColor: '#EAEFEF',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      x: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
    },
  };

  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#9a9da8', font: { size: 10 }, boxWidth: 10 } },
      tooltip: {
        backgroundColor: 'rgba(19,19,31,0.95)',
        titleColor: '#EA9D63',
        bodyColor: '#EAEFEF',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
    },
  };

  const getConditionBreakdown = (w: WeatherData) => {
    const codes = w.daily.slice(0, 7).map(d => d.weatherCode);
    const categories = [
      { label: 'Clear / Sunny', range: [0, 1], icon: Sun, color: '#F0AD4E', desc: 'Clear skies with minimal cloud cover' },
      { label: 'Partly Cloudy', range: [2, 48], icon: Cloud, color: '#A2B7C7', desc: 'Mixed clouds with some sun visible' },
      { label: 'Rain / Drizzle', range: [51, 82], icon: CloudRain, color: '#3b82f6', desc: 'Precipitation expected, light to heavy' },
      { label: 'Storm / Thunder', range: [95, 99], icon: CloudLightning, color: '#9B59B6', desc: 'Thunderstorms with possible lightning' },
    ];
    return categories.map(cat => ({
      ...cat,
      count: codes.filter(c => c >= cat.range[0] && c <= cat.range[1]).length,
    }));
  };

  if (loading) return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Analytics</h1><div className="skeleton mt-1 h-4 w-48" /></div>
      <div className="grid-tiles-2">{[1,2,3,4].map(i => <div key={i} className="tile"><div className="skeleton h-[180px] w-full" /></div>)}</div>
    </div>
  );

  if (error || !weather) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error || 'No data available'}</p>
      <button onClick={load} className="glass-btn px-4 py-2 text-xs">Retry</button>
    </div>
  );

  const temps = weather.daily.slice(0, 7);
  const breakdown = getConditionBreakdown(weather);
  const avgMax = Math.round(temps.reduce((a, b) => a + b.maxTemp, 0) / temps.length);
  const avgMin = Math.round(temps.reduce((a, b) => a + b.minTemp, 0) / temps.length);
  const highest = Math.max(...temps.map(t => t.maxTemp));
  const lowest = Math.min(...temps.map(t => t.minTemp));
  const tempRange = Math.round((highest - lowest) * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Analytics</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />
            {current.name}, {current.country}
          </p>
        </div>
        <button onClick={load} className="glass-badge cursor-pointer inline-flex items-center">
          <RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh
        </button>
      </div>

      <div className="grid-tiles-4">
        <div className="tile text-center">
          <Thermometer className="mx-auto mb-1 h-5 w-5" style={{ color: 'var(--primary)' }} />
          <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{weather.current.temperature}C</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Current</p>
        </div>
        <div className="tile text-center">
          <Droplets className="mx-auto mb-1 h-5 w-5" style={{ color: '#3b82f6' }} />
          <p className="text-xl font-bold text-blue-400">{weather.current.humidity}%</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Humidity</p>
        </div>
        <div className="tile text-center">
          <Wind className="mx-auto mb-1 h-5 w-5" style={{ color: '#10b981' }} />
          <p className="text-xl font-bold text-emerald-400">{weather.current.windSpeed}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Wind km/h</p>
        </div>
        <div className="tile text-center">
          <BarChart3 className="mx-auto mb-1 h-5 w-5" style={{ color: pm25 !== null ? (pm25 <= 35 ? '#5CB85C' : '#F0AD4E') : 'var(--text-muted)' }} />
          <p className="text-xl font-bold" style={{ color: pm25 !== null ? (pm25 <= 35 ? '#5CB85C' : '#F0AD4E') : 'var(--text-muted)' }}>{pm25 ?? '--'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>PM2.5 ug/m3</p>
        </div>
      </div>

      <div className="grid-tiles-2">
        <div className="tile">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="tile-title">7-Day Temperature Range</h3>
            <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--tile-border)', color: 'var(--text-secondary)' }}>
              <Info className="h-3 w-3" style={{ color: 'var(--primary)' }} />
              Daily max &amp; min with average line
            </div>
          </div>
          <div className="h-[200px]">
            <Bar data={{ labels: temps.map(t => new Date(t.time).toLocaleDateString('en', { weekday: 'short' })),
              datasets: [
                { label: 'Max', data: temps.map(t => t.maxTemp), backgroundColor: '#EA9D6390', borderRadius: 6, borderSkipped: false as any },
                { label: 'Min', data: temps.map(t => t.minTemp), backgroundColor: '#3b82f690', borderRadius: 6, borderSkipped: false as any },
              ] }} options={{ ...barOpts, plugins: { legend: { display: true, labels: { color: '#9a9da8', font: { size: 10 } } } } }} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Max</p>
              <p className="text-lg font-bold" style={{ color: '#EA9D63' }}>{avgMax}C</p>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Min</p>
              <p className="text-lg font-bold" style={{ color: '#3b82f6' }}>{avgMin}C</p>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Range</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{tempRange}C</p>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Highest</p>
              <p className="text-lg font-bold" style={{ color: '#D9534F' }}>{highest}C</p>
            </div>
          </div>
        </div>

        <div className="tile">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="tile-title">Weather Conditions (7 Days)</h3>
            <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--tile-border)', color: 'var(--text-secondary)' }}>
              <Info className="h-3 w-3" style={{ color: 'var(--primary)' }} />
              Breakdown of expected weather patterns
            </div>
          </div>
          <div className="h-[180px]">
            <Doughnut data={{ labels: breakdown.map(b => b.label),
              datasets: [{ data: breakdown.map(b => b.count), backgroundColor: breakdown.map(b => b.color), borderWidth: 0, hoverOffset: 4 }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9a9da8', font: { size: 10 }, padding: 10 } } } }} />
          </div>
          <div className="space-y-2 mt-3">
            {breakdown.map(b => (
              <div key={b.label} className="flex items-center gap-2 py-1.5">
                <b.icon className="h-4 w-4 shrink-0" style={{ color: b.color }} />
                <div className="flex-1">
                  <p className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>{b.label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{b.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: b.color }}>{b.count}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>day(s)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tile">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="tile-title">Precipitation Probability (7 Days)</h3>
          <div className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--tile-border)', color: 'var(--text-secondary)' }}>
            <Info className="h-3 w-3" style={{ color: 'var(--primary)' }} />
            Percentage chance of rain/drizzle per day
          </div>
        </div>
        <div className="h-[180px]">
          <Line data={{ labels: temps.map(t => new Date(t.time).toLocaleDateString('en', { weekday: 'short' })),
            datasets: [{
              label: 'Rain %', data: temps.map(t => t.precipitationProbability),
              borderColor: '#3b82f6', backgroundColor: '#3b82f620', borderWidth: 2,
              fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
            }] }} options={lineOpts} />
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'var(--text-secondary)' }}>
          Yellow line = higher rain chance. Blue fill = accumulated moisture. These values help plan outdoor activities.
        </p>
      </div>

      <div className="tile">
        <h3 className="tile-title">Weekly Forecast Summary</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {weather.daily.slice(0, 7).map((d, i) => (
            <div key={i} className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>{new Date(d.time).toLocaleDateString('en', { weekday: 'short' })}</p>
              <p className="my-1 text-xl" style={{ minHeight: '2.5rem' }}>{wmoEmoji(d.weatherCode)}</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{d.maxTemp}C / {d.minTemp}C</p>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{wmoDescription(d.weatherCode)}</p>
              <p className="text-[10px]" style={{ color: '#3b82f6' }}>{d.precipitationProbability}% rain</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
