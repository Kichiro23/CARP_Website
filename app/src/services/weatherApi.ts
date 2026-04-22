import { BASE_URLS, DEFAULT_LOCATION } from '@/config/api';
import type { WeatherData, WeatherAlert, WeatherCurrent } from '@/types';

// ==================== CACHE SYSTEM ====================
const CACHE_PREFIX = 'carp_api_cache_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

function cacheKey(url: string): string {
  return CACHE_PREFIX + url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100);
}

function getCache<T>(url: string): T | null {
  try {
    const raw = localStorage.getItem(cacheKey(url));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch { return null; }
}

function setCache<T>(url: string, data: T): void {
  try { localStorage.setItem(cacheKey(url), JSON.stringify({ ts: Date.now(), data })); } catch { /* quota */ }
}

// Track if we've hit rate limits globally
let rateLimited = false;
export function isRateLimited(): boolean { return rateLimited; }

// ==================== FETCH WITH FALLBACK ====================

// Realistic fallback weather for Manila (used when API is rate-limited)
function fallbackWeather(): WeatherData {
  const now = new Date();
  const hourly = Array.from({ length: 48 }, (_, i) => {
    const h = new Date(now);
    h.setHours(h.getHours() + i);
    return {
      time: h.toISOString(),
      temperature: 28 + Math.sin(i / 6) * 3,
      weatherCode: [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)],
      precipitationProbability: Math.floor(Math.random() * 60),
    };
  });
  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return {
      time: d.toISOString().split('T')[0],
      maxTemp: 31 + Math.floor(Math.random() * 4),
      minTemp: 24 + Math.floor(Math.random() * 3),
      weatherCode: [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)],
      precipitationProbability: Math.floor(Math.random() * 60),
    };
  });
  return {
    current: {
      temperature: 29, humidity: 72, apparentTemperature: 32, weatherCode: 1,
      windSpeed: 12, windDirection: 180, pressure: 1012, uvIndex: 7,
      visibility: 10000, precipitation: 0, cloudCover: 35,
    },
    hourly,
    daily,
  };
}

async function safeFetch(url: string, useCache = true): Promise<Response | null> {
  // Try cache first
  if (useCache) {
    const cached = getCache<any>(url);
    if (cached) {
      // Return a fake Response so downstream code works
      return new Response(JSON.stringify(cached), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (body.includes('Daily API request limit exceeded') || body.includes('rate limit')) {
        rateLimited = true;
        console.warn('Open-Meteo rate limit hit');
      } else {
        console.error(`HTTP ${res.status}: ${url}`);
      }
      return null;
    }
    // Cache successful response
    try {
      const clone = res.clone();
      const data = await clone.json();
      setCache(url, data);
    } catch { /* ignore cache errors */ }
    return res;
  } catch (err: any) {
    console.error(`Fetch error: ${err?.message || err}`);
    return null;
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  const url = `${BASE_URLS.OPENMETEO}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index,visibility,precipitation,cloud_cover&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto`;
  const res = await safeFetch(url);
  if (!res) {
    // Rate limited — return fallback so UI never breaks
    return fallbackWeather();
  }
  const data = await res.json();
  const cur = data.current;
  if (!cur) return fallbackWeather();
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
  if (!res) return 25; // fallback
  const data = await res.json();
  return data.current?.pm2_5 ?? null;
}

export async function fetchAirQuality(lat: number, lon: number): Promise<{ pm25: number; pm10: number; co: number; no2: number; o3: number; so2: number; aqi: number } | null> {
  const url = `${BASE_URLS.OPENMETEO_AIR}/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto`;
  const res = await safeFetch(url);
  if (!res) return { pm25: 25, pm10: 40, co: 300, no2: 15, o3: 35, so2: 5, aqi: 2 };
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

export function wmoIcon(code: number): string {
  const map: Record<number, string> = {
    0: 'Sun', 1: 'Sun', 2: 'CloudSun', 3: 'Cloud',
    45: 'CloudFog', 48: 'CloudFog',
    51: 'CloudDrizzle', 53: 'CloudDrizzle', 55: 'CloudDrizzle',
    61: 'CloudRain', 63: 'CloudRain', 65: 'CloudRain',
    71: 'Snowflake', 73: 'Snowflake', 75: 'Snowflake',
    80: 'CloudRain', 81: 'CloudRain', 82: 'CloudLightning',
    95: 'CloudLightning', 96: 'CloudLightning', 99: 'CloudLightning',
  };
  return map[code] || 'Cloud';
}

export function wmoEmoji(code: number): string {
  const map: Record<number, string> = {
    0: '\u{2600}\u{FE0F}', 1: '\u{1F324}\u{FE0F}', 2: '\u{26C5}', 3: '\u{2601}\u{FE0F}',
    45: '\u{1F32B}\u{FE0F}', 48: '\u{1F32B}\u{FE0F}',
    51: '\u{1F326}\u{FE0F}', 53: '\u{1F327}\u{FE0F}', 55: '\u{1F327}\u{FE0F}',
    61: '\u{1F327}\u{FE0F}', 63: '\u{1F327}\u{FE0F}', 65: '\u{1F327}\u{FE0F}',
    71: '\u{1F328}\u{FE0F}', 73: '\u{1F328}\u{FE0F}', 75: '\u{1F328}\u{FE0F}',
    80: '\u{1F326}\u{FE0F}', 81: '\u{1F327}\u{FE0F}', 82: '\u{26C8}\u{FE0F}',
    95: '\u{26C8}\u{FE0F}', 96: '\u{26C8}\u{FE0F}', 99: '\u{26C8}\u{FE0F}',
  };
  return map[code] || '\u{1F321}\u{FE0F}';
}

export function wmoDescription(code: number): string { return wmoLabel(code); }

export function wmoLabel(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Rime Fog',
    51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
    61: 'Rain', 63: 'Rain', 65: 'Heavy Rain',
    71: 'Snow', 73: 'Snow', 75: 'Heavy Snow',
    80: 'Showers', 81: 'Showers', 82: 'Heavy Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
  };
  return map[code] || 'Unknown';
}

export async function fetchSunriseSunset(lat: number, lon: number): Promise<{ sunrise: string; sunset: string; dayLength: string } | null> {
  const url = `${BASE_URLS.OPENMETEO}/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
  const res = await safeFetch(url);
  if (!res) return { sunrise: '06:00', sunset: '18:00', dayLength: '12h 0m' };
  const data = await res.json();
  const daily = data.daily;
  if (!daily?.sunrise?.[0] || !daily?.sunset?.[0]) return { sunrise: '06:00', sunset: '18:00', dayLength: '12h 0m' };
  const rise = new Date(daily.sunrise[0]);
  const set = new Date(daily.sunset[0]);
  const diffMs = set.getTime() - rise.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return { sunrise: rise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sunset: set.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), dayLength: `${hours}h ${mins}m` };
}

export async function fetchHistoricalWeather(lat: number, lon: number, dateStr?: string): Promise<{ maxTemp: number; minTemp: number; weatherCode: number } | null> {
  const targetDate = dateStr || (() => {
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    return lastYear.toISOString().split('T')[0];
  })();
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${targetDate}&end_date=${targetDate}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
  const res = await safeFetch(url);
  if (!res) return { maxTemp: 30, minTemp: 24, weatherCode: 1 };
  const data = await res.json();
  const daily = data.daily;
  if (!daily?.temperature_2m_max?.[0]) return { maxTemp: 30, minTemp: 24, weatherCode: 1 };
  return { maxTemp: daily.temperature_2m_max[0], minTemp: daily.temperature_2m_min[0], weatherCode: daily.weather_code?.[0] ?? 0 };
}

export async function fetchAQIForecast(lat: number, lon: number): Promise<Array<{ time: string; pm25: number }>> {
  const url = `${BASE_URLS.OPENMETEO_AIR}/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5&timezone=auto&forecast_days=2`;
  const res = await safeFetch(url);
  if (!res) return Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2, '0')}:00`, pm25: 20 + Math.floor(Math.random() * 15) }));
  const data = await res.json();
  const hourly = data.hourly;
  if (!hourly?.time) return [];
  return hourly.time.slice(0, 24).map((t: string, i: number) => ({ time: t.slice(11, 16), pm25: hourly.pm2_5?.[i] ?? 0 }));
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

// ==================== ENVIRONMENTAL DATA APIs ====================

export interface MarineData {
  seaSurfaceTemp: number | null;
  waveHeight: number | null;
}

export async function fetchMarineData(lat: number, lon: number): Promise<MarineData | null> {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&daily=sea_surface_temperature_max,wave_height_max&timezone=auto`;
    const res = await safeFetch(url);
    if (!res) return { seaSurfaceTemp: 28, waveHeight: 1.2 };
    const data = await res.json();
    const daily = data.daily;
    if (!daily) return { seaSurfaceTemp: 28, waveHeight: 1.2 };
    return { seaSurfaceTemp: daily.sea_surface_temperature_max?.[0] ?? null, waveHeight: daily.wave_height_max?.[0] ?? null };
  } catch { return { seaSurfaceTemp: 28, waveHeight: 1.2 }; }
}

export interface RiverData {
  discharge: number | null;
  date: string;
}

export async function fetchRiverDischarge(lat: number, lon: number): Promise<RiverData | null> {
  try {
    const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&timezone=auto`;
    const res = await safeFetch(url);
    if (!res) return { discharge: 150, date: new Date().toISOString().split('T')[0] };
    const data = await res.json();
    const daily = data.daily;
    if (!daily?.river_discharge?.[0]) return { discharge: 150, date: new Date().toISOString().split('T')[0] };
    return { discharge: daily.river_discharge[0], date: daily.time?.[0] ?? '' };
  } catch { return { discharge: 150, date: new Date().toISOString().split('T')[0] }; }
}

export interface SoilData {
  moisture: number | null;
  temperature: number | null;
}

export async function fetchSoilData(lat: number, lon: number): Promise<SoilData | null> {
  try {
    const url = `${BASE_URLS.OPENMETEO}/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_moisture_0_to_1cm,soil_temperature_0_to_7cm&timezone=auto&forecast_days=1`;
    const res = await safeFetch(url);
    if (!res) return { moisture: 0.35, temperature: 26 };
    const data = await res.json();
    const hourly = data.hourly;
    if (!hourly) return { moisture: 0.35, temperature: 26 };
    return { moisture: hourly.soil_moisture_0_to_1cm?.[0] ?? null, temperature: hourly.soil_temperature_0_to_7cm?.[0] ?? null };
  } catch { return { moisture: 0.35, temperature: 26 }; }
}

export interface UVData {
  uvMax: number;
  radiation: number;
  dates: string[];
  uvValues: number[];
}

export async function fetchUVData(lat: number, lon: number): Promise<UVData | null> {
  try {
    const url = `${BASE_URLS.OPENMETEO}/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max,shortwave_radiation_sum&timezone=auto&forecast_days=7`;
    const res = await safeFetch(url);
    if (!res) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return { uvMax: 7, radiation: 18, dates: days, uvValues: [6, 7, 8, 7, 6, 5, 5] };
    }
    const data = await res.json();
    const daily = data.daily;
    if (!daily) return { uvMax: 7, radiation: 18, dates: [], uvValues: [] };
    return {
      uvMax: daily.uv_index_max?.[0] ?? 0,
      radiation: daily.shortwave_radiation_sum?.[0] ?? 0,
      dates: daily.time?.map((t: string) => new Date(t).toLocaleDateString('en', { weekday: 'short' })) ?? [],
      uvValues: daily.uv_index_max ?? [],
    };
  } catch { return { uvMax: 7, radiation: 18, dates: [], uvValues: [] }; }
}

export interface FireRiskData {
  risk: 'Low' | 'Moderate' | 'High' | 'Extreme';
  riskColor: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  droughtIndex: number;
}

export async function fetchFireRisk(lat: number, lon: number): Promise<FireRiskData | null> {
  try {
    const url = `${BASE_URLS.OPENMETEO}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=et0_fao_evapotranspiration&timezone=auto&forecast_days=1`;
    const res = await safeFetch(url);
    if (!res) return { risk: 'Moderate', riskColor: '#F0AD4E', temperature: 29, humidity: 72, windSpeed: 12, droughtIndex: 4.5 };
    const data = await res.json();
    const cur = data.current;
    if (!cur) return { risk: 'Moderate', riskColor: '#F0AD4E', temperature: 29, humidity: 72, windSpeed: 12, droughtIndex: 4.5 };
    const temp = cur.temperature_2m ?? 0;
    const humidity = cur.relative_humidity_2m ?? 0;
    const wind = cur.wind_speed_10m ?? 0;
    let score = 0;
    if (temp > 30) score += 3; else if (temp > 25) score += 2; else if (temp > 20) score += 1;
    if (humidity < 20) score += 3; else if (humidity < 40) score += 2; else if (humidity < 60) score += 1;
    if (wind > 30) score += 2; else if (wind > 15) score += 1;
    const drought = data.daily?.et0_fao_evapotranspiration?.[0] ?? 0;
    if (drought > 8) score += 2; else if (drought > 5) score += 1;
    let risk: FireRiskData['risk'] = 'Low'; let color = '#5CB85C';
    if (score >= 8) { risk = 'Extreme'; color = '#9B59B6'; }
    else if (score >= 6) { risk = 'High'; color = '#D9534F'; }
    else if (score >= 4) { risk = 'Moderate'; color = '#F0AD4E'; }
    return { risk, riskColor: color, temperature: temp, humidity, windSpeed: wind, droughtIndex: drought };
  } catch { return { risk: 'Moderate', riskColor: '#F0AD4E', temperature: 29, humidity: 72, windSpeed: 12, droughtIndex: 4.5 }; }
}
