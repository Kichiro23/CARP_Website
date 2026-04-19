import type { WeatherData, CountryData } from '@/types';

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index,precipitation,weather_code&hourly=temperature_2m,relative_humidity_2m,uv_index,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
    const res = await fetch(url);
    const data = await res.json();
    const now = new Date();
    const hours: string[] = [], temps: number[] = [], hums: number[] = [], uvs: number[] = [], precs: number[] = [];
    for (let i = 0; i < data.hourly.time.length && hours.length < 24; i++) {
      if (new Date(data.hourly.time[i]) >= now) {
        hours.push(data.hourly.time[i].slice(11, 16));
        temps.push(data.hourly.temperature_2m[i]);
        hums.push(data.hourly.relative_humidity_2m[i]);
        uvs.push(data.hourly.uv_index[i] || 0);
        precs.push(data.hourly.precipitation[i] || 0);
      }
    }
    return {
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        uvIndex: data.current.uv_index || 0,
        precipitation: data.current.precipitation || 0,
        weatherCode: data.current.weather_code,
      },
      daily: data.daily.time.map((t: string, i: number) => ({
        date: t,
        dayName: new Date(t).toLocaleDateString('en', { weekday: 'short' }),
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        weatherCode: data.daily.weather_code[i],
      })),
      hourly: { time: hours, temperature: temps, humidity: hums, uvIndex: uvs, precipitation: precs },
    };
  } catch { return null; }
}

export async function fetchPM25(lat: number, lon: number): Promise<number | null> {
  try {
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`);
    const data = await res.json();
    return data.current?.pm2_5 !== undefined ? Math.round(data.current.pm2_5) : null;
  } catch { return null; }
}

export async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string; country?: string } | null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const data = await res.json();
    if (data.results?.[0]) return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name, country: data.results[0].country };
    return null;
  } catch { return null; }
}

export function wmoEmoji(code: number): string {
  const map: Record<number, string> = { 0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫', 51: '🌦', 53: '🌦', 55: '🌧', 61: '🌧', 63: '🌧', 65: '🌧', 71: '🌨', 80: '🌦', 95: '⛈', 99: '⛈' };
  return map[code] || '🌡';
}

export function wmoLabel(code: number): string {
  const map: Record<number, string> = { 0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Icy Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle', 61: 'Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Snow', 80: 'Showers', 95: 'Thunderstorm', 99: 'Thunderstorm' };
  return map[code] || 'Unknown';
}

export function pm25Class(v: number): { cls: string; label: string } {
  if (v < 12) return { cls: 'good', label: 'Good' };
  if (v < 35.4) return { cls: 'moderate', label: 'Moderate' };
  if (v < 55.4) return { cls: 'usg', label: 'Unhealthy for Sensitive' };
  if (v < 150.4) return { cls: 'unhealthy', label: 'Unhealthy' };
  if (v < 250.4) return { cls: 'very', label: 'Very Unhealthy' };
  return { cls: 'hazardous', label: 'Hazardous' };
}

export function aqiColor(v: number): string {
  if (v < 12) return '#5CB85C';
  if (v < 35.4) return '#F0AD4E';
  if (v < 55.4) return '#E87040';
  if (v < 150.4) return '#D9534F';
  if (v < 250.4) return '#9B59B6';
  return '#7B2D2D';
}

export function generateInsights(w: WeatherData['current']): string[] {
  const insights: string[] = [];
  if (w.temperature > 32) insights.push('🔥 Very hot — stay hydrated, limit outdoor exposure 11am–3pm.');
  else if (w.temperature > 28) insights.push('☀️ Warm — dress lightly and drink plenty of water.');
  else if (w.temperature < 18) insights.push('❄️ Cool — bring a jacket.');
  if (w.humidity > 75) insights.push('💧 High humidity — mosquito repellent recommended.');
  if (w.humidity < 35) insights.push('🏜️ Low humidity — stay hydrated.');
  if (w.uvIndex > 7) insights.push('🧴 Very high UV — apply SPF 30+, wear a hat.');
  if (w.precipitation > 2) insights.push('☔ Rain expected — bring an umbrella.');
  if (insights.length === 0) insights.push('✅ Comfortable conditions — good for outdoor activities!');
  return insights;
}

export const COUNTRIES: CountryData[] = [
  // Philippines (expanded)
  { country: 'Philippines', region: 'Asia', city: 'Manila', lat: 14.5995, lon: 120.9842 },
  { country: 'Philippines', region: 'Asia', city: 'Quezon City', lat: 14.6760, lon: 121.0437 },
  { country: 'Philippines', region: 'Asia', city: 'Makati', lat: 14.5547, lon: 121.0244 },
  { country: 'Philippines', region: 'Asia', city: 'Pasig', lat: 14.5764, lon: 121.0851 },
  { country: 'Philippines', region: 'Asia', city: 'Taguig', lat: 14.5176, lon: 121.0509 },
  { country: 'Philippines', region: 'Asia', city: 'Caloocan', lat: 14.6492, lon: 120.9818 },
  { country: 'Philippines', region: 'Asia', city: 'Malolos', lat: 14.8443, lon: 120.8104 },
  { country: 'Philippines', region: 'Asia', city: 'Cebu', lat: 10.3157, lon: 123.8854 },
  { country: 'Philippines', region: 'Asia', city: 'Davao', lat: 7.1907, lon: 125.4553 },
  { country: 'Philippines', region: 'Asia', city: 'Iloilo', lat: 10.7202, lon: 122.5621 },
  { country: 'Philippines', region: 'Asia', city: 'Zamboanga', lat: 6.9214, lon: 122.0790 },
  { country: 'Philippines', region: 'Asia', city: 'Baguio', lat: 16.4023, lon: 120.5960 },
  { country: 'Philippines', region: 'Asia', city: 'Bacolod', lat: 10.6400, lon: 122.9680 },
  { country: 'Philippines', region: 'Asia', city: 'Cagayan de Oro', lat: 8.4542, lon: 124.6319 },
  { country: 'Philippines', region: 'Asia', city: 'Angeles', lat: 15.1457, lon: 120.5647 },
  // Asia
  { country: 'Indonesia', region: 'Asia', city: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { country: 'India', region: 'Asia', city: 'New Delhi', lat: 28.6139, lon: 77.2090 },
  { country: 'China', region: 'Asia', city: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { country: 'Thailand', region: 'Asia', city: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { country: 'Japan', region: 'Asia', city: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { country: 'South Korea', region: 'Asia', city: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { country: 'Singapore', region: 'Asia', city: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { country: 'Vietnam', region: 'Asia', city: 'Hanoi', lat: 21.0278, lon: 105.8342 },
  { country: 'Malaysia', region: 'Asia', city: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869 },
  { country: 'UAE', region: 'Asia', city: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { country: 'Bangladesh', region: 'Asia', city: 'Dhaka', lat: 23.8103, lon: 90.4125 },
  { country: 'Pakistan', region: 'Asia', city: 'Karachi', lat: 24.8607, lon: 67.0011 },
  { country: 'Turkey', region: 'Asia', city: 'Istanbul', lat: 41.0082, lon: 28.9784 },
  { country: 'Saudi Arabia', region: 'Asia', city: 'Riyadh', lat: 24.7136, lon: 46.6753 },
  { country: 'Taiwan', region: 'Asia', city: 'Taipei', lat: 25.0330, lon: 121.5654 },
  { country: 'Myanmar', region: 'Asia', city: 'Yangon', lat: 16.8661, lon: 96.1951 },
  { country: 'Nepal', region: 'Asia', city: 'Kathmandu', lat: 27.7172, lon: 85.3240 },
  { country: 'Cambodia', region: 'Asia', city: 'Phnom Penh', lat: 11.5564, lon: 104.9282 },
  { country: 'Sri Lanka', region: 'Asia', city: 'Colombo', lat: 6.9271, lon: 79.8612 },
  { country: 'Mongolia', region: 'Asia', city: 'Ulaanbaatar', lat: 47.8864, lon: 106.9057 },
  // Europe
  { country: 'UK', region: 'Europe', city: 'London', lat: 51.5074, lon: -0.1278 },
  { country: 'France', region: 'Europe', city: 'Paris', lat: 48.8566, lon: 2.3522 },
  { country: 'Germany', region: 'Europe', city: 'Berlin', lat: 52.5200, lon: 13.4050 },
  { country: 'Spain', region: 'Europe', city: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { country: 'Italy', region: 'Europe', city: 'Rome', lat: 41.9028, lon: 12.4964 },
  { country: 'Russia', region: 'Europe', city: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { country: 'Netherlands', region: 'Europe', city: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { country: 'Switzerland', region: 'Europe', city: 'Zurich', lat: 47.3769, lon: 8.5417 },
  { country: 'Sweden', region: 'Europe', city: 'Stockholm', lat: 59.3293, lon: 18.0686 },
  { country: 'Poland', region: 'Europe', city: 'Warsaw', lat: 52.2297, lon: 21.0122 },
  { country: 'Greece', region: 'Europe', city: 'Athens', lat: 37.9838, lon: 23.7275 },
  { country: 'Portugal', region: 'Europe', city: 'Lisbon', lat: 38.7223, lon: -9.1393 },
  { country: 'Norway', region: 'Europe', city: 'Oslo', lat: 59.9139, lon: 10.7522 },
  { country: 'Czech Republic', region: 'Europe', city: 'Prague', lat: 50.0755, lon: 14.4378 },
  { country: 'Hungary', region: 'Europe', city: 'Budapest', lat: 47.4979, lon: 19.0402 },
  // Americas
  { country: 'USA', region: 'Americas', city: 'New York', lat: 40.7128, lon: -74.0060 },
  { country: 'USA', region: 'Americas', city: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { country: 'Brazil', region: 'Americas', city: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { country: 'Mexico', region: 'Americas', city: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { country: 'Canada', region: 'Americas', city: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { country: 'Argentina', region: 'Americas', city: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { country: 'Chile', region: 'Americas', city: 'Santiago', lat: -33.4489, lon: -70.6693 },
  { country: 'Colombia', region: 'Americas', city: 'Bogotá', lat: 4.7110, lon: -74.0721 },
  { country: 'Peru', region: 'Americas', city: 'Lima', lat: -12.0464, lon: -77.0428 },
  { country: 'Venezuela', region: 'Americas', city: 'Caracas', lat: 10.4806, lon: -66.9036 },
  // Africa
  { country: 'Egypt', region: 'Africa', city: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { country: 'Nigeria', region: 'Africa', city: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { country: 'South Africa', region: 'Africa', city: 'Johannesburg', lat: -26.2041, lon: 28.0473 },
  { country: 'Kenya', region: 'Africa', city: 'Nairobi', lat: -1.2921, lon: 36.8219 },
  { country: 'Morocco', region: 'Africa', city: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { country: 'Ethiopia', region: 'Africa', city: 'Addis Ababa', lat: 9.1450, lon: 40.4897 },
  { country: 'Ghana', region: 'Africa', city: 'Accra', lat: 5.6037, lon: -0.1870 },
  { country: 'Tanzania', region: 'Africa', city: 'Dar es Salaam', lat: -6.7924, lon: 39.2083 },
  { country: 'Algeria', region: 'Africa', city: 'Algiers', lat: 36.7538, lon: 3.0588 },
  { country: 'Uganda', region: 'Africa', city: 'Kampala', lat: 0.3476, lon: 32.5825 },
  // Oceania
  { country: 'Australia', region: 'Oceania', city: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { country: 'Australia', region: 'Oceania', city: 'Melbourne', lat: -37.8136, lon: 144.9631 },
  { country: 'New Zealand', region: 'Oceania', city: 'Auckland', lat: -36.8485, lon: 174.7633 },
  { country: 'Fiji', region: 'Oceania', city: 'Suva', lat: -18.1248, lon: 178.4501 },
  { country: 'Papua New Guinea', region: 'Oceania', city: 'Port Moresby', lat: -9.4438, lon: 147.1803 },
];

export const MAP_CITIES = COUNTRIES;
