import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { fetchWeather, COUNTRIES } from '@/services/weatherApi';
import { Bar } from 'react-chartjs-2';
import '@/lib/chart';

export default function Analytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState<Record<string, { temp: number; humidity: number; wind: number; uv: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const results: Record<string, { temp: number; humidity: number; wind: number; uv: number }> = {};
      await Promise.all(COUNTRIES.slice(0, 12).map(async (c) => {
        const w = await fetchWeather(c.lat, c.lon);
        if (w) results[c.city] = { temp: w.current.temperature, humidity: w.current.humidity, wind: w.current.windSpeed, uv: w.current.uvIndex };
      }));
      setData(results); setLoading(false);
    }
    load();
  }, []);

  const cities = Object.keys(data);
  const chartOpts = {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: isDark ? '#9a9da8' : '#5a5d6b', font: { size: 10 }, maxTicksLimit: 8 }, grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } },
      y: { ticks: { color: isDark ? '#9a9da8' : '#5a5d6b' }, grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } },
    },
  };
  const temps = cities.map((c) => data[c].temp);
  const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '0';
  const hottest = temps.length ? cities[temps.indexOf(Math.max(...temps))] : '-';
  const windArr = cities.map((c) => data[c].wind);
  const windiest = windArr.length ? cities[windArr.indexOf(Math.max(...windArr))] : '-';

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Analytics</h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Global weather analytics across {cities.length} cities</p>
      </div>

      <div className="grid-tiles-4">
        {[
          { label: 'Avg Temp', value: `${avgTemp}C`, icon: Thermometer, color: 'var(--primary)' },
          { label: 'Avg Humidity', value: `${cities.length ? Math.round(cities.reduce((s, c) => s + data[c].humidity, 0) / cities.length) : 0}%`, icon: Droplets, color: '#3b82f6' },
          { label: 'Hottest City', value: hottest, icon: Sun, color: '#f59e0b' },
          { label: 'Windiest', value: windiest, icon: Wind, color: '#10b981' },
        ].map((card) => (
          <div key={card.label} className="tile">
            <div className="tile-icon" style={{ background: card.color + '15' }}>
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
            <p className="mt-1 text-lg font-bold truncate" style={{ color: 'var(--text)' }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid-tiles-2">
        {[
          { label: 'Temperature', color: '#EA9D63', data: temps },
          { label: 'Humidity', color: '#3b82f6', data: cities.map((c) => data[c].humidity) },
          { label: 'Wind Speed', color: '#10b981', data: cities.map((c) => data[c].wind) },
          { label: 'UV Index', color: '#f59e0b', data: cities.map((c) => data[c].uv) },
        ].map((c) => (
          <div key={c.label} className="tile">
            <h3 className="tile-title">{c.label} by City</h3>
            <div className="h-[180px]">
              <Bar data={{ labels: cities, datasets: [{ data: c.data, backgroundColor: c.color + '60', borderColor: c.color, borderWidth: 1, borderRadius: 5 }] }} options={chartOpts} />
            </div>
          </div>
        ))}
      </div>

      <div className="tile !p-0 overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--tile-border)' }}>
          <h3 className="tile-title !mb-0">City Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['City', 'Temp', 'Humidity', 'Wind', 'UV'].map((h) => <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--primary)' }}>{h}</th>)}
            </tr></thead>
            <tbody>{cities.map((city) => (
              <tr key={city} className="border-b last:border-0 hover:bg-[var(--primary)]/5 transition-colors" style={{ borderColor: 'var(--tile-border)' }}>
                <td className="px-5 py-2.5"><div className="flex items-center gap-2 min-w-0"><Globe className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} /><span className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{city}</span></div></td>
                <td className="px-5 py-2.5 text-xs font-bold whitespace-nowrap" style={{ color: 'var(--primary)' }}>{data[city].temp}C</td>
                <td className="px-5 py-2.5 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{data[city].humidity}%</td>
                <td className="px-5 py-2.5 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{data[city].wind} km/h</td>
                <td className="px-5 py-2.5 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{data[city].uv}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
