import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Thermometer, Globe } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { fetchWeather, COUNTRIES } from '@/services/weatherApi';
import { Line } from 'react-chartjs-2';
import '@/lib/chart';

export default function Trends() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [region, setRegion] = useState('All');
  const [data, setData] = useState<Record<string, { temp: number; humidity: number; region: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const results: Record<string, { temp: number; humidity: number; region: string }> = {};
      await Promise.all(COUNTRIES.slice(0, 15).map(async (c) => {
        const w = await fetchWeather(c.lat, c.lon);
        if (w) results[c.city] = { temp: w.current.temperature, humidity: w.current.humidity, region: c.region };
      }));
      setData(results); setLoading(false);
    }
    load();
  }, []);

  const cities = Object.keys(data);
  const filtered = region === 'All' ? cities : cities.filter((c) => data[c].region === region);
  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

  const chartOpts = {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: isDark ? '#9a9da8' : '#5a5d6b', font: { size: 10 } }, grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } },
      y: { ticks: { color: isDark ? '#9a9da8' : '#5a5d6b' }, grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } },
    },
  };

  const regionAvgs = regions.slice(1).map((r) => {
    const rc = cities.filter((c) => data[c].region === r);
    if (!rc.length) return null;
    const avgTemp = rc.reduce((s, c) => s + data[c].temp, 0) / rc.length;
    const avgHum = rc.reduce((s, c) => s + data[c].humidity, 0) / rc.length;
    const trend = avgTemp > 28 ? 'up' : avgTemp < 15 ? 'down' : 'flat';
    return { region: r, avgTemp, avgHum, count: rc.length, trend };
  }).filter(Boolean);

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Trends</h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Temperature and humidity trends by region</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {regions.map((r) => <button key={r} onClick={() => setRegion(r)} className={`glass-tab text-xs ${region === r ? 'active' : ''}`}>{r}</button>)}
      </div>

      <div className="grid-tiles-3">
        {regionAvgs.filter(Boolean).map((r) => r && (
          <div key={r.region} className="tile">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{r.region}</span>
              </div>
              {r.trend === 'up' ? <TrendingUp className="h-4 w-4 shrink-0 text-red-400" /> : r.trend === 'down' ? <TrendingDown className="h-4 w-4 shrink-0 text-blue-400" /> : <Minus className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />}
            </div>
            <div className="flex gap-4">
              <div><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Temp</p><p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{r.avgTemp.toFixed(1)}C</p></div>
              <div><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Hum</p><p className="text-xl font-bold" style={{ color: '#3b82f6' }}>{r.avgHum.toFixed(0)}%</p></div>
              <div><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Cities</p><p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{r.count}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="tile">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
          <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Temperature ({filtered.length} cities)</h3>
        </div>
        <div className="h-[240px]">
          <Line data={{ labels: filtered, datasets: [{ data: filtered.map((c) => data[c].temp), borderColor: '#EA9D63', backgroundColor: '#EA9D6318', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 7, pointBackgroundColor: '#EA9D63' }] }} options={chartOpts} />
        </div>
      </div>

      <div className="tile !p-0 overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--tile-border)' }}>
          <h3 className="tile-title !mb-0">City Conditions {region !== 'All' ? `\u2014 ${region}` : ''}</h3>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((city) => (
            <div key={city} className="tile !p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{city}</span>
                <span className="glass-badge text-[10px]" style={{ color: 'var(--primary)' }}>{data[city].region}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Temp: <b style={{ color: 'var(--primary)' }}>{data[city].temp}C</b></span>
                <span style={{ color: 'var(--text-muted)' }}>Hum: <b style={{ color: '#3b82f6' }}>{data[city].humidity}%</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
