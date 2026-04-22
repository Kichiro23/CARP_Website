import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Droplets, Wind, RefreshCw, Shirt, Umbrella, HeartPulse, Clock, AlertTriangle, Share2, Sunrise, Sunset, History, Flame, Sprout, Sun, Users } from 'lucide-react';
import { fetchWeather, fetchPM25, fetchAirQuality, fetchSunriseSunset, fetchHistoricalWeather, fetchAQIForecast, fetchFireRisk, fetchUVData, isRateLimited, wmoEmoji, wmoLabel, aqiColor, pm25Class } from '@/services/weatherApi';
import { fetchNews } from '@/services/newsApi';
import { Line } from 'react-chartjs-2';
import LocationSelector from '@/components/LocationSelector';
import CitySearch from '@/components/CitySearch';
import type { WeatherData, AQIForecast } from '@/types';
import type { SavedLocation } from '@/hooks/useLocation';
import type { NewsArticle } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const NEWS_FALLBACK = '/news-fallback.jpg';

interface Props {
  current: SavedLocation;
  locations: SavedLocation[];
  selectLocation: (loc: SavedLocation) => void;
  addLocation: (loc: Omit<SavedLocation, 'id' | 'isDefault'>) => void;
}

export default function Dashboard({ current, locations, selectLocation, addLocation }: Props) {
  const nav = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [pm25, setPm25] = useState<number | null>(null);
  const [airQuality, setAirQuality] = useState<{ pm25: number; pm10: number; co: number; no2: number; o3: number; so2: number; aqi: number } | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // New features state
  const [sunriseSunset, setSunriseSunset] = useState<{ sunrise: string; sunset: string; dayLength: string } | null>(null);
  const [historical, setHistorical] = useState<{ maxTemp: number; minTemp: number; weatherCode: number } | null>(null);
  const [aqiForecast, setAqiForecast] = useState<AQIForecast[]>([]);
  const [shared, setShared] = useState(false);
  const [alerts, setAlerts] = useState<Array<{ id: string; title: string; desc: string; severity: 'low' | 'medium' | 'high' }>>([]);
  const [showRateLimit, setShowRateLimit] = useState(false);
  const [fireRisk, setFireRisk] = useState<{ risk: string; riskColor: string } | null>(null);
  const [uvData, setUVData] = useState<{ uvMax: number; radiation: number } | null>(null);
  const [population, setPopulation] = useState(() => {
    const elapsed = (Date.now() - 1704067200000) / 1000;
    return Math.floor(8_100_000_000 + elapsed * 2.3);
  });
  const [clocks, setClocks] = useState<string[]>([
    'Asia/Manila', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'
  ].map(tz => new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })));

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - 1704067200000) / 1000;
      setPopulation(Math.floor(8_100_000_000 + elapsed * 2.3));
      setClocks(['Asia/Manila', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'].map(tz =>
        new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      ));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      // Fetch weather data independently so partial failures don't break everything
      const w = await fetchWeather(current.lat, current.lng);
      setWeather(w);
      if (!w) { setError('Could not load weather data. Check your connection.'); setLoading(false); return; }
      setShowRateLimit(isRateLimited());

      // Fetch secondary data in parallel
      const [p, aq, n, ss, hist, aqiF, fr, uv] = await Promise.all([
        fetchPM25(current.lat, current.lng).catch(() => null),
        fetchAirQuality(current.lat, current.lng).catch(() => null),
        fetchNews().catch(() => []),
        fetchSunriseSunset(current.lat, current.lng).catch(() => null),
        fetchHistoricalWeather(current.lat, current.lng).catch(() => null),
        fetchAQIForecast(current.lat, current.lng).catch(() => []),
        fetchFireRisk(current.lat, current.lng).catch(() => null),
        fetchUVData(current.lat, current.lng).catch(() => null),
      ]);
      setPm25(p); setAirQuality(aq); setNews((n as any).slice(0, 4));
      setSunriseSunset(ss); setHistorical(hist); setAqiForecast(aqiF as any);
      setFireRisk(fr); setUVData(uv);
      setLastUpdated(new Date());

      // Generate alerts based on current conditions
      const newAlerts: Array<{ id: string; title: string; desc: string; severity: 'low' | 'medium' | 'high' }> = [];
      const cur = w.current;
      if (cur.temperature > 35) newAlerts.push({ id: 'heat', title: 'Heat Warning', desc: `Temperature reaching ${cur.temperature}°C. Stay hydrated and avoid prolonged sun exposure.`, severity: 'high' });
      if (cur.uvIndex > 8) newAlerts.push({ id: 'uv', title: 'High UV Alert', desc: `UV index at ${cur.uvIndex}. Apply SPF 50+ sunscreen and seek shade.`, severity: 'medium' });
      if (cur.windSpeed > 50) newAlerts.push({ id: 'wind', title: 'Strong Winds', desc: `Wind speeds up to ${cur.windSpeed} km/h. Secure loose outdoor items.`, severity: 'high' });
      if (p !== null && p > 55) newAlerts.push({ id: 'aqi', title: 'Poor Air Quality', desc: `PM2.5 at ${p}. Wear a mask if going outdoors.`, severity: 'medium' });
      if (cur.precipitation > 10) newAlerts.push({ id: 'rain', title: 'Heavy Rain', desc: `Heavy precipitation expected. Carry an umbrella and watch for flooding.`, severity: 'medium' });
      setAlerts(newAlerts);
    } catch { setError('Failed to load data.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [current.lat, current.lng]);

  const handleAddCity = (city: { name: string; country: string; lat: number; lng: number }) => {
    const exists = locations.some(l => l.name === city.name && l.country === city.country);
    if (!exists) addLocation(city);
  };

  const handleShare = () => {
    if (!weather) return;
    const cur = weather.current;
    const text = `It's ${cur.temperature}°C and ${wmoLabel(cur.weatherCode)} in ${current.name}. AQI: ${pm25 !== null ? pm25 : '--'}. Check CARP for more details: https://weathercarp.com`;
    navigator.clipboard.writeText(text).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  const cOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: 'var(--text-muted)', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: 'var(--tile-border)' } },
              y: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { color: 'var(--tile-border)' } } } };

  const aqiChartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: 'var(--text-muted)', maxTicksLimit: 6, font: { size: 10 } }, grid: { color: 'var(--tile-border)' } },
              y: { ticks: { color: 'var(--text-muted)', font: { size: 10 } }, grid: { color: 'var(--tile-border)' } } } };

  if (loading) return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1><div className="skeleton mt-1 h-4 w-40" /></div>
      </div>
      <div className="grid-tiles-4">{[1, 2, 3, 4].map(i => <div key={i} className="tile"><div className="skeleton mb-2 h-8 w-8 rounded-lg" /><div className="skeleton h-6 w-20 mb-1" /><div className="skeleton h-3 w-24" /></div>)}</div>
      <div className="tile"><div className="skeleton h-4 w-40 mb-3" /><div className="grid-tiles-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div></div>
    </div>
  );

  if (error || !weather) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error || 'No data available'}</p>
      <button onClick={load} className="glass-btn px-5 py-2 text-xs"><RefreshCw className="mr-1 h-3 w-3" /> Retry</button>
    </div>
  );

  const cur = weather.current;
  const aqiTxt = pm25 !== null ? (pm25 <= 12 ? 'Good' : pm25 <= 35 ? 'Moderate' : pm25 <= 55 ? 'Unhealthy' : 'Hazardous') : '';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <LocationSelector locations={locations} current={current} onSelect={selectLocation} />
            <CitySearch onSelect={handleAddCity} placeholder="+ Add city" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-badge"><Clock className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} />{time.toLocaleTimeString()}</div>
          <button onClick={load} className="glass-badge cursor-pointer"><RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh</button>
          <button onClick={handleShare} className="glass-badge cursor-pointer" title="Share weather">
            <Share2 className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> {shared ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {showRateLimit && (
        <div className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs" style={{ background: 'rgba(240,173,78,0.08)', borderColor: 'rgba(240,173,78,0.25)', color: '#F0AD4E' }}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>API rate limit reached. Showing estimated data. Real data will return tomorrow.</span>
        </div>
      )}

      {/* Population + Clocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="tile flex items-center gap-3">
          <Users className="h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} />
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--primary)' }}>World Population</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>{population.toLocaleString('en-US')}</p>
          </div>
        </div>
        <div className="tile flex items-center gap-2 overflow-x-auto">
          {['Manila', 'UTC', 'NYC', 'London', 'Tokyo'].map((label, i) => (
            <div key={label} className="text-center min-w-[52px]">
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-xs font-bold tabular-nums" style={{ color: 'var(--text)' }}>{clocks[i] || '--:--:--'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <History className="h-3 w-3" />
          Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {/* Severe Weather Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-xl border px-4 py-3"
              style={{
                background: alert.severity === 'high' ? 'rgba(217,83,79,0.08)' : 'rgba(240,173,78,0.08)',
                borderColor: alert.severity === 'high' ? 'rgba(217,83,79,0.2)' : 'rgba(240,173,78,0.2)'
              }}
            >
              <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${alert.severity === 'high' ? 'text-red-400' : 'text-orange-400'}`} />
              <div>
                <p className={`text-xs font-bold ${alert.severity === 'high' ? 'text-red-400' : 'text-orange-400'}`}>{alert.title}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{alert.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid-tiles-4">
        <div className="tile">
          <div className="tile-icon" style={{ background: 'rgba(234,157,99,0.10)' }}><Thermometer className="h-4 w-4" style={{ color: 'var(--primary)' }} /></div>
          <p className="tile-value">{cur.temperature}<span className="unit">C</span></p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{wmoEmoji(cur.weatherCode)} {wmoLabel(cur.weatherCode)}</p>
        </div>
        <div className="tile">
          <div className="tile-icon" style={{ background: 'rgba(59,130,246,0.10)' }}><Droplets className="h-4 w-4 text-blue-400" /></div>
          <p className="tile-value">{cur.humidity}<span className="unit">%</span></p>
          <p className="tile-desc">Relative humidity</p>
        </div>
        <div className="tile">
          <div className="tile-icon" style={{ background: 'rgba(16,185,129,0.10)' }}><Wind className="h-4 w-4 text-emerald-400" /></div>
          <p className="tile-value">{cur.windSpeed}<span className="unit"> km/h</span></p>
          <p className="tile-desc">10m above ground</p>
        </div>
        <div className="tile">
          <div className="tile-icon" style={{ background: pm25 !== null ? `${aqiColor(pm25)}15` : 'rgba(255,255,255,0.04)' }}>
            <AlertTriangle className="h-4 w-4" style={{ color: pm25 !== null ? aqiColor(pm25) : 'var(--text-muted)' }} />
          </div>
          <p className="tile-value" style={{ color: pm25 !== null ? aqiColor(pm25) : 'var(--text)' }}>{pm25 !== null ? pm25 : '--'}</p>
          {aqiTxt && <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold mt-1 ${pm25Class(pm25 || 0)}`}>{aqiTxt}</span>}
          <p className="tile-desc mt-1">PM2.5</p>
        </div>
      </div>

      {/* Sunrise / Sunset + Last Year */}
      <div className="grid-tiles-3">
        {sunriseSunset && (
          <div className="tile">
            <h3 className="tile-title">Sun & Moon</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sunrise className="h-5 w-5" style={{ color: '#F0AD4E' }} />
                <div><p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{sunriseSunset.sunrise}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sunrise</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Sunset className="h-5 w-5" style={{ color: '#E87040' }} />
                <div><p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{sunriseSunset.sunset}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sunset</p></div>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>Daylight: {sunriseSunset.dayLength}</p>
          </div>
        )}
        {historical && (
          <div className="tile">
            <h3 className="tile-title">This Day Last Year</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{wmoEmoji(historical.weatherCode)}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{historical.maxTemp}° / {historical.minTemp}°</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{wmoLabel(historical.weatherCode)}</p>
              </div>
            </div>
            <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {cur.temperature > historical.maxTemp ? 'Warmer' : 'Cooler'} than last year by {Math.abs(cur.temperature - historical.maxTemp).toFixed(1)}°
            </p>
          </div>
        )}
        <div className="tile">
          <h3 className="tile-title">Conditions</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs"><span style={{ color: 'var(--text-muted)' }}>UV Index</span><span style={{ color: 'var(--text)' }}>{cur.uvIndex}</span></div>
            <div className="flex justify-between text-xs"><span style={{ color: 'var(--text-muted)' }}>Pressure</span><span style={{ color: 'var(--text)' }}>{cur.pressure} hPa</span></div>
            <div className="flex justify-between text-xs"><span style={{ color: 'var(--text-muted)' }}>Visibility</span><span style={{ color: 'var(--text)' }}>{(cur.visibility / 1000).toFixed(1)} km</span></div>
            <div className="flex justify-between text-xs"><span style={{ color: 'var(--text-muted)' }}>Cloud Cover</span><span style={{ color: 'var(--text)' }}>{cur.cloudCover}%</span></div>
          </div>
        </div>
      </div>

      {/* Environmental Quick Glance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fireRisk && (
          <div className="tile text-center">
            <Flame className="mx-auto mb-1 h-5 w-5" style={{ color: fireRisk.riskColor }} />
            <p className="text-lg font-bold" style={{ color: fireRisk.riskColor }}>{fireRisk.risk}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Fire Risk</p>
          </div>
        )}
        {uvData && (
          <div className="tile text-center">
            <Sun className="mx-auto mb-1 h-5 w-5 text-yellow-400" />
            <p className="text-lg font-bold text-yellow-400">{uvData.uvMax}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>UV Max · {uvData.uvMax <= 2 ? 'Low' : uvData.uvMax <= 5 ? 'Mod' : uvData.uvMax <= 7 ? 'High' : 'Very High'}</p>
          </div>
        )}
        <div className="tile text-center">
          <Sprout className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
          <p className="text-lg font-bold text-emerald-400">{(cur.humidity + cur.temperature) / 2 > 35 ? 'Dry' : 'Normal'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Soil Estimate</p>
        </div>
        <div className="tile text-center">
          <Droplets className="mx-auto mb-1 h-5 w-5 text-blue-400" />
          <p className="text-lg font-bold text-blue-400">{cur.precipitation > 0 ? `${cur.precipitation}mm` : 'None'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Precipitation</p>
        </div>
      </div>

      {/* AQI 24h Forecast */}
      {aqiForecast.length > 0 && (
        <div className="tile">
          <h3 className="tile-title">PM2.5 Forecast (24h)</h3>
          <div className="h-[160px]">
            <Line data={{
              labels: aqiForecast.map(d => d.time),
              datasets: [{
                data: aqiForecast.map(d => d.pm25),
                borderColor: '#d48952',
                backgroundColor: 'rgba(212,137,82,0.08)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
              }]
            }} options={aqiChartOpts} />
          </div>
        </div>
      )}

      {/* Air Quality Index */}
      {airQuality && (
        <div className="tile" style={{ background: `linear-gradient(135deg, ${aqiColor(airQuality.pm25)}08, transparent)` }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: aqiColor(airQuality.pm25) }}>Air Quality Index</h3>
            <button onClick={() => nav('/air-quality')} className="text-[10px] font-semibold hover:opacity-70" style={{ color: 'var(--primary)' }}>View Details &rarr;</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold" style={{ background: `${aqiColor(airQuality.pm25)}20`, border: `2px solid ${aqiColor(airQuality.pm25)}`, color: aqiColor(airQuality.pm25) }}>
              {airQuality.aqi}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                {airQuality.aqi <= 1 ? 'Good' : airQuality.aqi <= 2 ? 'Moderate' : airQuality.aqi <= 3 ? 'Unhealthy for Sensitive Groups' : airQuality.aqi <= 4 ? 'Unhealthy' : 'Hazardous'}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>PM2.5: {airQuality.pm25} | PM10: {airQuality.pm10} | O3: {airQuality.o3}</p>
            </div>
            <div className="h-2 w-32 rounded-full hidden sm:block" style={{ background: 'var(--tile-bg)' }}>
              <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (airQuality.aqi / 5) * 100)}%`, background: aqiColor(airQuality.pm25) }} />
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="tile">
        <h3 className="tile-title">AI Weather Intelligence</h3>
        <div className="grid-tiles-3">
          <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(234,157,99,0.15)', background: 'rgba(234,157,99,0.03)' }}>
            <div className="mb-2 flex items-center gap-2"><Shirt className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} /><span className="text-[10px] font-bold uppercase" style={{ color: 'var(--primary)' }}>Clothing</span></div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {cur.temperature > 32 ? 'Very hot - wear light breathable fabrics, hat, and sunglasses.' : cur.temperature > 26 ? 'Warm - short sleeves and light clothing ideal.' : cur.temperature > 20 ? 'Pleasant - t-shirt with light layers recommended.' : cur.temperature > 10 ? 'Cool - bring a jacket or sweater.' : 'Cold - wear warm layers, coat, and gloves.'}
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.03)' }}>
            <div className="mb-2 flex items-center gap-2"><Umbrella className="h-4 w-4 shrink-0 text-blue-400" /><span className="text-[10px] font-bold uppercase text-blue-400">Travel</span></div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {cur.precipitation > 5 ? 'Heavy rain expected - bring umbrella, avoid low-lying areas.' : cur.precipitation > 0 ? 'Light drizzle possible - carry a light rain jacket.' : cur.windSpeed > 30 ? 'Windy conditions - secure loose items outdoors.' : 'Good conditions - clear skies, safe for travel.'}
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.03)' }}>
            <div className="mb-2 flex items-center gap-2"><HeartPulse className="h-4 w-4 shrink-0 text-emerald-400" /><span className="text-[10px] font-bold uppercase text-emerald-400">Health</span></div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {cur.uvIndex > 10 ? 'Extreme UV - SPF 50+, seek shade 10am-4pm.' : cur.uvIndex > 7 ? 'Very high UV - use sunscreen SPF 30+, wear hat.' : cur.uvIndex > 5 ? 'High UV - apply sunscreen, limit sun exposure.' : cur.uvIndex > 2 ? 'Moderate UV - basic sun protection recommended.' : 'Low UV - minimal protection needed.'}
              {pm25 !== null && pm25 > 35 && ' Air quality poor - consider wearing a mask outdoors.'}
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="tile">
        <h3 className="tile-title">7-Day Forecast</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {weather.daily.slice(0, 7).map((d, i) => {
            const date = new Date(d.time);
            return (
              <div key={i} className="tile !p-3 text-center">
                <p className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>{DAYS[date.getDay()]}</p>
                <p className="my-1 text-2xl">{wmoEmoji(d.weatherCode)}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{d.maxTemp}C</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.minTemp}C low &middot; {d.precipitationProbability}% rain</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid-tiles-2">
        <div className="tile">
          <div className="mb-3 flex items-center gap-2"><Thermometer className="h-4 w-4" style={{ color: 'var(--primary)' }} /><h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Temperature (24H)</h3></div>
          <div className="h-[180px]"><Line data={{ labels: weather.hourly.slice(0, 24).map(h => h.time.slice(11, 16)), datasets: [{ data: weather.hourly.slice(0, 24).map(h => h.temperature), borderColor: '#EA9D63', backgroundColor: '#EA9D6318', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }] }} options={cOpts} /></div>
        </div>
        <div className="tile">
          <div className="mb-3 flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-400" /><h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Precipitation (24H)</h3></div>
          <div className="h-[180px]"><Line data={{ labels: weather.hourly.slice(0, 24).map(h => h.time.slice(11, 16)), datasets: [{ data: weather.hourly.slice(0, 24).map(h => h.precipitationProbability), borderColor: '#3b82f6', backgroundColor: '#3b82f618', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }] }} options={cOpts} /></div>
        </div>
      </div>

      {/* News */}
      {news.length > 0 && (
        <div className="tile">
          <div className="flex items-center justify-between mb-3">
            <h3 className="tile-title">Climate News</h3>
            <button onClick={() => nav('/news')} className="text-[10px] font-semibold hover:opacity-70" style={{ color: 'var(--primary)' }}>View All &rarr;</button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {news.slice(0, 4).map((a, i) => (
              <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-xl border p-3 transition-all hover:border-[#EA9D6330]" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
                <img src={a.thumbnail || NEWS_FALLBACK} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).src = NEWS_FALLBACK; }} />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-clamp-2" style={{ color: 'var(--text)' }}>{a.title}</h4>
                  <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.pubDate} &middot; {a.source}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
