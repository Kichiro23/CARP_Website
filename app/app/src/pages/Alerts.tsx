import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Wind, Thermometer, Sun, CloudRain, RefreshCw } from 'lucide-react';
import { fetchWeather, fetchPM25, COUNTRIES, pm25Class, aqiColor } from '@/services/weatherApi';

interface Alert {
  city: string;
  type: string;
  severity: 'warning' | 'watch';
  msg: string;
  val: string;
  color: string;
  icon: typeof Thermometer;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const list: Alert[] = [];
    await Promise.all(COUNTRIES.slice(0, 12).map(async (c) => {
      const [w, pm] = await Promise.all([fetchWeather(c.lat, c.lon), fetchPM25(c.lat, c.lon)]);
      if (!w) return;
      if (w.current.temperature > 35) list.push({ city: c.city, type: 'heat', severity: 'warning', msg: 'Extreme heat - avoid outdoor exposure', val: `${w.current.temperature}C`, color: '#D9534F', icon: Thermometer });
      else if (w.current.temperature > 32) list.push({ city: c.city, type: 'heat', severity: 'watch', msg: 'High temperature - stay hydrated', val: `${w.current.temperature}C`, color: '#F0AD4E', icon: Thermometer });
      if (w.current.temperature < 5) list.push({ city: c.city, type: 'cold', severity: 'warning', msg: 'Freezing - dress warmly', val: `${w.current.temperature}C`, color: '#3b82f6', icon: Thermometer });
      if (w.current.windSpeed > 50) list.push({ city: c.city, type: 'wind', severity: 'warning', msg: 'Dangerous winds', val: `${w.current.windSpeed} km/h`, color: '#9B59B6', icon: Wind });
      else if (w.current.windSpeed > 35) list.push({ city: c.city, type: 'wind', severity: 'watch', msg: 'Strong winds - exercise caution', val: `${w.current.windSpeed} km/h`, color: '#F0AD4E', icon: Wind });
      if (w.current.precipitation > 10) list.push({ city: c.city, type: 'rain', severity: 'warning', msg: 'Heavy rain - flooding possible', val: `${w.current.precipitation}mm`, color: '#3b82f6', icon: CloudRain });
      if (w.current.uvIndex > 10) list.push({ city: c.city, type: 'uv', severity: 'warning', msg: 'Extreme UV - avoid sun', val: `${w.current.uvIndex}`, color: '#D9534F', icon: Sun });
      if (pm && pm > 35) { const a = pm25Class(pm); list.push({ city: c.city, type: 'aqi', severity: pm >= 55 ? 'warning' : 'watch', msg: `AQI: ${a.label}`, val: `${pm} ug/m3`, color: aqiColor(pm), icon: AlertTriangle }); }
    }));
    setAlerts(list); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const warnings = alerts.filter((a) => a.severity === 'warning');
  const watches = alerts.filter((a) => a.severity === 'watch');

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="spinner" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Active Alerts</h1>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Real-time weather and air quality alerts</p>
        </div>
        <button onClick={load} className="glass-badge cursor-pointer" style={{ color: 'var(--text)' }}>
          <RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh
        </button>
      </div>

      <div className="grid-tiles-2">
        <div className="tile text-center" style={{ borderColor: 'rgba(217,83,79,0.2)' }}>
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" />
          <p className="text-3xl font-bold text-red-400">{warnings.length}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Warnings</p>
        </div>
        <div className="tile text-center" style={{ borderColor: 'rgba(240,173,78,0.2)' }}>
          <Shield className="mx-auto mb-2 h-6 w-6 text-[#F0AD4E]" />
          <p className="text-3xl font-bold text-[#F0AD4E]">{watches.length}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Watches</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="tile py-12 text-center">
          <Shield className="mx-auto mb-4 h-10 w-10 text-emerald-400" />
          <h3 className="text-base font-bold text-emerald-400">All Clear</h3>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>No active weather alerts across monitored cities.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a, i) => (
            <div key={`${a.city}-${i}`} className="tile !p-4" style={{ borderColor: a.color + '25' }}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: a.color + '15' }}>
                  <a.icon className="h-5 w-5" style={{ color: a.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{a.city}</span>
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase shrink-0" style={{ background: a.color + '18', color: a.color }}>{a.severity}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.msg}</p>
                </div>
                <span className="shrink-0 text-base font-bold" style={{ color: a.color }}>{a.val}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
