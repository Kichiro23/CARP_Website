import { useState, useEffect, useCallback } from 'react';

interface CachedWeather {
  temp: number;
  weatherCode: number;
  wind: number;
  humidity: number;
  updatedAt: number;
  forecast?: any;
  hourly?: any;
}

const CACHE_KEY = 'carp-weather-cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function readCache(): CachedWeather | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedWeather;
    if (Date.now() - parsed.updatedAt > CACHE_TTL) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(data: CachedWeather) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export function useWeatherCache(lat: number = 14.5995, lon: number = 120.9842) {
  const [cache, setCache] = useState<CachedWeather | null>(readCache);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      const cached: CachedWeather = {
        temp: data.current?.temperature_2m ?? 0,
        weatherCode: data.current?.weather_code ?? 0,
        wind: data.current?.wind_speed_10m ?? 0,
        humidity: data.current?.relative_humidity_2m ?? 0,
        updatedAt: Date.now(),
        forecast: data.daily,
        hourly: data.hourly,
      };
      writeCache(cached);
      setCache(cached);
    } catch { /* silent */ }
    setLoading(false);
  }, [lat, lon]);

  useEffect(() => {
    const cached = readCache();
    if (!cached) refresh();
    else setCache(cached);
  }, [refresh]);

  return { cache, refresh, loading };
}
