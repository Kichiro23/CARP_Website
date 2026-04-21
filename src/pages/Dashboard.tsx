import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Droplets, Wind, RefreshCw, Shirt, Umbrella, HeartPulse, Clock, AlertTriangle } from 'lucide-react';
import { fetchWeather, fetchPM25, fetchAirQuality, wmoEmoji, wmoLabel, aqiColor, pm25Class } from '@/services/weatherApi';
import { fetchNews } from '@/services/newsApi';
import { Line } from 'react-chartjs-2';
import LocationSelector from '@/components/LocationSelector';
import CitySearch from '@/components/CitySearch';
import type { WeatherData } from '@/types';
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

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [w, p, aq, n] = await Promise.all([
        fetchWeather(current.lat, current.lng),
        fetchPM25(current.lat, current.lng),
        fetchAirQuality(current.lat, current.lng),
        fetchNews(),
      ]);
      setWeather(w); setPm25(p); setAirQuality(aq); setNews(n.slice(0, 4));
      if (!w) setError('Could not load weather data. Check your connection.');
    } catch { setError('Failed to load data.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [current.lat, current.lng]);

  const handleAddCity = (city: { name: string; country: string; lat: number; lng: number }) => {
    const exists = locations.some(l => l.name === city.name && l.country === city.country);
    if (!exists) addLocation(city);
  };

  const cOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: '#9a9da8', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
              y: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } } } };

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
        </div>
      </div>

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
            <div className="h-2 w-32 rounded-full hidden sm:block" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (airQuality.aqi / 5) * 100)}%`, background: aqiColor(airQuality.pm25) }} />
            </div>
          </div>
        </div>
      )}

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
