import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Sun, CloudRain, Wind, RefreshCw, MapPin, Shirt, Umbrella, HeartPulse, Clock, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { fetchWeather, fetchPM25, wmoEmoji, wmoLabel, pm25Class, aqiColor } from '@/services/weatherApi';
import { DEFAULT_LOCATION } from '@/config/api';
import type { WeatherData } from '@/types';
import '@/lib/chart';
import { Line } from 'react-chartjs-2';

function getLocation() {
  const saved = localStorage.getItem('carp_location');
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return { city: DEFAULT_LOCATION.city, country: DEFAULT_LOCATION.country };
}

function SkeletonTile({ h = 100 }: { h?: number }) {
  return <div className="tile"><div className="skeleton" style={{ height: h }} /></div>;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [pm25, setPm25] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const loc = getLocation();

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const w = await fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
    const p = await fetchPM25(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
    setWeather(w); setPm25(p); setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: isDark ? '#9a9da8' : '#5a5d6b', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } },
      y: { ticks: { color: isDark ? '#9a9da8' : '#5a5d6b', font: { size: 10 } }, grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' } },
    },
  };

  const aqi = pm25 !== null ? pm25Class(pm25) : null;
  const wmo = weather ? wmoLabel(weather.current.weatherCode) : '';
  const wmoIcon = weather ? wmoEmoji(weather.current.weatherCode) : '';

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid-tiles-4">
          <SkeletonTile /><SkeletonTile /><SkeletonTile /><SkeletonTile />
        </div>
        <SkeletonTile h={120} />
        <SkeletonTile h={140} />
        <div className="grid-tiles-2">
          <SkeletonTile h={200} /><SkeletonTile h={200} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />
            {loc.city}, {loc.country}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="glass-badge" style={{ color: 'var(--text)' }}>
            <Clock className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} />
            <span className="text-ellipsis">{currentTime.toLocaleTimeString('en-US', { hour12: true })}</span>
          </div>
          <button onClick={loadData} className="glass-badge cursor-pointer hover:border-[var(--primary)]/30 transition-colors" style={{ color: 'var(--text)' }}>
            <RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh
          </button>
        </div>
      </div>

      {/* TILE 1: Weather Metrics */}
      <div className="grid-tiles-4 stagger">
        {/* Temperature */}
        <div className="tile animate-fadeInUp">
          <div className="tile-icon" style={{ background: 'rgba(234,157,99,0.10)' }}>
            <Thermometer className="h-4 w-4" style={{ color: 'var(--primary)' }} />
          </div>
          <p className="tile-value">{weather?.current.temperature || 0}<span className="unit">C</span></p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{wmoIcon} {wmo}</p>
        </div>

        {/* Humidity */}
        <div className="tile animate-fadeInUp">
          <div className="tile-icon" style={{ background: 'rgba(59,130,246,0.10)' }}>
            <Droplets className="h-4 w-4 text-blue-400" />
          </div>
          <p className="tile-value">{weather?.current.humidity || 0}<span className="unit">%</span></p>
          <p className="tile-desc">Relative humidity</p>
        </div>

        {/* Wind */}
        <div className="tile animate-fadeInUp">
          <div className="tile-icon" style={{ background: 'rgba(16,185,129,0.10)' }}>
            <Wind className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="tile-value">{weather?.current.windSpeed || 0}<span className="unit"> km/h</span></p>
          <p className="tile-desc">10m above ground</p>
        </div>

        {/* AQI */}
        <div className="tile animate-fadeInUp">
          <div className="tile-icon" style={{ background: aqi ? `${aqiColor(pm25 || 0)}15` : 'rgba(255,255,255,0.04)' }}>
            <AlertTriangle className="h-4 w-4" style={{ color: aqi ? aqiColor(pm25 || 0) : 'var(--text-muted)' }} />
          </div>
          <p className="tile-value" style={{ color: aqi ? aqiColor(pm25 || 0) : 'var(--text)' }}>{pm25 !== null ? pm25 : '--'}</p>
          {aqi && <span className={`aqi-badge aqi-${aqi.cls} mt-1 text-[10px]`}>{aqi.label}</span>}
          <p className="tile-desc mt-1">PM2.5 (ug/m3)</p>
        </div>
      </div>

      {/* TILE 2: AI Weather Intelligence */}
      {weather && (
        <div className="tile animate-fadeInUp">
          <h3 className="tile-title">AI Weather Intelligence</h3>
          <div className="grid-tiles-3">
            <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(234,157,99,0.15)', background: 'rgba(234,157,99,0.03)' }}>
              <div className="mb-2 flex items-center gap-2">
                <Shirt className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--primary)' }}>Clothing</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {weather.current.temperature > 32 ? 'Very hot - wear light, breathable fabrics and a hat.' :
                 weather.current.temperature > 26 ? 'Warm - short sleeves and light cotton ideal.' :
                 weather.current.temperature > 20 ? 'Pleasant - t-shirt with light layers works.' :
                 weather.current.temperature > 14 ? 'Cool - bring a jacket or sweater.' :
                 'Cold - warm layers, coat, and gloves recommended.'}
              </p>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.03)' }}>
              <div className="mb-2 flex items-center gap-2">
                <Umbrella className="h-4 w-4 shrink-0 text-blue-400" />
                <span className="text-[10px] font-bold uppercase text-blue-400">Travel</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {weather.current.precipitation > 5 ? 'Heavy rain - bring umbrella, avoid low roads.' :
                 weather.current.precipitation > 1 ? 'Light rain possible - compact umbrella handy.' :
                 weather.current.precipitation > 0 ? 'Drizzle possible - roads may be wet.' :
                 weather.current.windSpeed > 40 ? 'Strong winds - secure loose objects.' :
                 'Good conditions - clear skies, safe roads.'}
              </p>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.03)' }}>
              <div className="mb-2 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase text-emerald-400">Health</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {weather.current.uvIndex > 10 ? 'Extreme UV - avoid sun 10am-4pm, SPF 50+.' :
                 weather.current.uvIndex > 7 ? 'Very high UV - limit outdoor time, use sunscreen.' :
                 weather.current.uvIndex > 5 ? 'High UV - apply sunscreen, seek shade.' :
                 weather.current.uvIndex > 2 ? 'Moderate UV - sunscreen still recommended.' :
                 'Low UV - minimal protection needed.'}
                {weather.current.humidity > 80 ? ' High humidity may discomfort sensitive people.' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TILE 3: 7-Day Forecast */}
      {weather && (
        <div className="tile animate-fadeInUp">
          <h3 className="tile-title">7-Day Forecast</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {weather.daily.slice(0, 7).map((day) => (
              <button key={day.date} className="tile !p-3 text-center" style={{ padding: '12px' }}>
                <p className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>{day.dayName}</p>
                <p className="my-1 text-lg">{wmoEmoji(day.weatherCode)}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{day.maxTemp}C</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{day.minTemp}C low</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TILE 4: Charts */}
      {weather && (
        <div className="grid-tiles-2 stagger">
          {[
            { label: 'Temperature (24H)', color: '#EA9D63', data: weather.hourly.temperature, icon: Thermometer },
            { label: 'Humidity (24H)', color: '#3b82f6', data: weather.hourly.humidity, icon: Droplets },
            { label: 'UV Index (24H)', color: '#f59e0b', data: weather.hourly.uvIndex, icon: Sun },
            { label: 'Precipitation (24H)', color: '#8b5cf6', data: weather.hourly.precipitation, icon: CloudRain },
          ].map((chart) => (
            <div key={chart.label} className="tile animate-fadeInUp">
              <div className="mb-3 flex items-center gap-2">
                <chart.icon className="h-4 w-4 shrink-0" style={{ color: chart.color }} />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ellipsis" style={{ color: chart.color }}>{chart.label}</h3>
              </div>
              <div className="h-[180px]">
                <Line data={{
                  labels: weather.hourly.time,
                  datasets: [{ data: chart.data, borderColor: chart.color, backgroundColor: chart.color + '18', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5 }]
                }} options={chartOpts} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
