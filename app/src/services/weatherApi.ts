import { BASE_URLS, DEFAULT_LOCATION } from '@/config/api';
import type { WeatherData, WeatherAlert, WeatherCurrent } from '@/types';

async function safeFetch(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.error(`HTTP ${res.status}: ${url}`); return null; }
    return res;
  } catch (err: any) { console.error(`Fetch error: ${err?.message || err}`); return null; }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  const url = `${BASE_URLS.OPENMETEO}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index,visibility,precipitation,cloud_cover&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto`;
  const res = await safeFetch(url);
  if (!res) return null;
  const data = await res.json();
  const cur = data.current;
  if (!cur) return null;
  return {
    current: {
      temperature: cur.temperature_2m ?? 0,
      humidity: cur.relative_humidity_2m ?? 0,
      apparentTemperature: cur.apparent_temperature ?? 0,
      weatherCode: cur.weather_code ?? 0,
      windSpeed: cur.wind_speed_10m ?? 0,
      windDirection: cur.wind_direction_10m ?? 0,
      pressure: cur.surface_pressure ?? 0,
      uvIndex: cur.uv_index ?? 0,
      visibility: cur.visibility ?? 0,
      precipitation: cur.precipitation ?? 0,
      cloudCover: cur.cloud_cover ?? 0,
    },
    hourly: (data.hourly?.time || []).map((t: string, i: number) => ({
      time: t, temperature: data.hourly.temperature_2m?.[i] ?? 0,
      weatherCode: data.hourly.weather_code?.[i] ?? 0,
      precipitationProbability: data.hourly.precipitation_probability?.[i] ?? 0,
    })),
    daily: (data.daily?.time || []).map((t: string, i: number) => ({
      time: t, maxTemp: data.daily.temperature_2m_max?.[i] ?? 0,
      minTemp: data.daily.temperature_2m_min?.[i] ?? 0,
      weatherCode: data.daily.weather_code?.[i] ?? 0,
      precipitationProbability: data.daily.precipitation_probability_max?.[i] ?? 0,
    })),
  };
}

export async function fetchPM25(lat: number, lon: number): Promise<number | null> {
  const res = await safeFetch(`${BASE_URLS.OPENMETEO_AIR}/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5&timezone=auto`);
  if (!res) return null;
  const data = await res.json();
  return data.current?.pm2_5 ?? null;
}

export async function fetchAirQuality(lat: number, lon: number): Promise<{ pm25: number; pm10: number; co: number; no2: number; o3: number; so2: number; aqi: number } | null> {
  const url = `${BASE_URLS.OPENMETEO_AIR}/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto`;
  const res = await safeFetch(url);
  if (!res) return null;
  const data = await res.json();
  const c = data.current;
  if (!c) return null;
  const pm25 = c.pm2_5 ?? 0;
  return {
    pm25, pm10: c.pm10 ?? 0, co: c.carbon_monoxide ?? 0,
    no2: c.nitrogen_dioxide ?? 0, o3: c.ozone ?? 0, so2: c.sulphur_dioxide ?? 0,
    aqi: pm25 <= 12 ? 1 : pm25 <= 35 ? 2 : pm25 <= 55 ? 3 : pm25 <= 150 ? 4 : 5,
  };
}

export async function geocodeCity(query: string): Promise<{ name: string; lat: number; lon: number; country: string } | null> {
  const res = await safeFetch(`${BASE_URLS.GEOCODE}/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  if (!res) return null;
  const data = await res.json();
  if (!data.results?.length) return null;
  const r = data.results[0];
  return { name: r.name, lat: r.latitude, lon: r.longitude, country: r.country || '' };
}

export async function fetchAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  const data = await fetchWeather(lat, lon);
  if (!data) return [];
  const cur = data.current;
  const alerts: WeatherAlert[] = [];
  if (cur.temperature > 35) alerts.push({ id: 'heat', type: 'heat', title: 'Heat Warning', description: `Temperature reaching ${cur.temperature}C. Stay hydrated.`, severity: 'medium', timestamp: new Date().toISOString(), location: 'Current Location' });
  if (cur.uvIndex > 8) alerts.push({ id: 'uv', type: 'uv', title: 'High UV Index', description: `UV index at ${cur.uvIndex}. Use sun protection.`, severity: 'medium', timestamp: new Date().toISOString(), location: 'Current Location' });
  if (cur.windSpeed > 50) alerts.push({ id: 'wind', type: 'storm', title: 'Strong Winds', description: `Wind speeds up to ${cur.windSpeed} km/h.`, severity: 'high', timestamp: new Date().toISOString(), location: 'Current Location' });
  return alerts;
}

export async function fetchCurrentLocationWeather(): Promise<{ weather: WeatherCurrent; lat: number; lon: number; city: string } | null> {
  try {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      const { latitude, longitude } = position.coords;
      const w = await fetchWeather(latitude, longitude);
      if (w) {
        const geo = await geocodeCity(`${latitude},${longitude}`);
        return { weather: w.current, lat: latitude, lon: longitude, city: geo?.name || 'Your Location' };
      }
    }
  } catch { /* fall through */ }
  const w = await fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
  if (w) return { weather: w.current, lat: DEFAULT_LOCATION.lat, lon: DEFAULT_LOCATION.lng, city: DEFAULT_LOCATION.city };
  return null;
}

export function aqiColor(pm: number): string {
  if (pm <= 12) return '#5CB85C';
  if (pm <= 35) return '#F0AD4E';
  if (pm <= 55) return '#E87040';
  if (pm <= 150) return '#D9534F';
  return '#9B59B6';
}

export function pm25Class(pm: number): string {
  if (pm <= 12) return 'bg-green-500/15 text-green-400';
  if (pm <= 35) return 'bg-orange-500/15 text-orange-400';
  if (pm <= 55) return 'bg-red-500/15 text-red-400';
  return 'bg-purple-500/15 text-purple-400';
}

export function wmoEmoji(code: number): string {
  const map: Record<number, string> = { 0: '\u2600\uFE0F', 1: '\u1F324\uFE0F', 2: '\u26C5', 3: '\u2601\uFE0F', 45: '\u1F32B\uFE0F', 48: '\u1F32B\uFE0F', 51: '\u1F326\uFE0F', 53: '\u1F327\uFE0F', 55: '\u1F327\uFE0F', 61: '\u1F327\uFE0F', 63: '\u1F327\uFE0F', 65: '\u1F327\uFE0F', 71: '\u1F328\uFE0F', 73: '\u1F328\uFE0F', 75: '\u1F328\uFE0F', 80: '\u1F326\uFE0F', 81: '\u1F327\uFE0F', 82: '\u26C8\uFE0F', 95: '\u26C8\uFE0F', 96: '\u26C8\uFE0F', 99: '\u26C8\uFE0F' };
  return map[code] || '\u1F321\uFE0F';
}

export function wmoLabel(code: number): string {
  const map: Record<number, string> = { 0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Rime Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle', 61: 'Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Snow', 73: 'Snow', 75: 'Heavy Snow', 80: 'Showers', 81: 'Showers', 82: 'Heavy Showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm' };
  return map[code] || 'Unknown';
}

export async function searchCitiesWeather(queries: string[]): Promise<Array<{ name: string; lat: number; lon: number; country: string; weather: WeatherCurrent | null; pm25: number | null }>> {
  const results = [];
  for (const query of queries.slice(0, 10)) {
    const geo = await geocodeCity(query);
    if (geo) {
      const [weather, pm25] = await Promise.all([fetchWeather(geo.lat, geo.lon), fetchPM25(geo.lat, geo.lon)]);
      results.push({ name: geo.name, lat: geo.lat, lon: geo.lon, country: geo.country, weather: weather?.current ?? null, pm25 });
    }
  }
  return results;
}
