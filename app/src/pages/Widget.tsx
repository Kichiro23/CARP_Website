import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchWeather, fetchPM25, wmoEmoji, wmoLabel, aqiColor } from '@/services/weatherApi';
import type { WeatherData } from '@/types';

export default function Widget() {
  const [params] = useSearchParams();
  const city = params.get('city') || 'Manila';
  const lat = parseFloat(params.get('lat') || '14.5995');
  const lon = parseFloat(params.get('lon') || '120.9842');

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [pm25, setPm25] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [w, p] = await Promise.all([fetchWeather(lat, lon), fetchPM25(lat, lon)]);
      setWeather(w);
      setPm25(p);
      setLoading(false);
    })();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="flex h-[200px] w-[320px] items-center justify-center rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--tile-border)' }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex h-[200px] w-[320px] items-center justify-center rounded-2xl border text-xs" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--tile-border)', color: 'var(--text-muted)' }}>
        Weather unavailable
      </div>
    );
  }

  const cur = weather.current;
  const today = weather.daily[0];

  return (
    <div className="flex h-[240px] w-[320px] flex-col justify-between rounded-2xl border p-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--tile-border)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{city}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{wmoLabel(cur.weatherCode)}</p>
        </div>
        <span className="text-3xl">{wmoEmoji(cur.weatherCode)}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--text)' }}>{cur.temperature}°</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>H: {today?.maxTemp}° L: {today?.minTemp}°</p>
        </div>
        <div className="text-right space-y-1">
          {pm25 !== null && (
            <div className="flex items-center gap-1 justify-end">
              <div className="h-2 w-2 rounded-full" style={{ background: aqiColor(pm25) }} />
              <span className="text-[10px] font-semibold" style={{ color: aqiColor(pm25) }}>PM2.5 {pm25}</span>
            </div>
          )}
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>💨 {cur.windSpeed} km/h</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>💧 {cur.humidity}%</p>
        </div>
      </div>
      {/* Mini 3-day forecast */}
      <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--tile-border)' }}>
        {weather.daily.slice(0, 3).map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{['Today', 'Tomorrow', 'Next'][i]}</p>
            <p className="text-sm">{wmoEmoji(d.weatherCode)}</p>
            <p className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>{d.maxTemp}°</p>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-center mt-1" style={{ color: 'var(--text-muted)' }}>weathercarp.com</p>
    </div>
  );
}
