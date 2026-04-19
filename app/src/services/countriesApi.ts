import { BASE_URLS } from '@/config/api';
import type { Country, City } from '@/types';

// Major cities data (used as fallback and for search)
export const MAJOR_CITIES: City[] = [
  { name: 'Manila', country: 'Philippines', countryCode: 'PH', region: 'Asia', lat: 14.5995, lng: 120.9842, population: 13923452 },
  { name: 'Beijing', country: 'China', countryCode: 'CN', region: 'Asia', lat: 39.9042, lng: 116.4074, population: 21540000 },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'Asia', lat: 35.6762, lng: 139.6503, population: 37400000 },
  { name: 'Delhi', country: 'India', countryCode: 'IN', region: 'Asia', lat: 28.6139, lng: 77.2090, population: 32900000 },
  { name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', region: 'Asia', lat: -6.2088, lng: 106.8456, population: 11000000 },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR', region: 'Asia', lat: 37.5665, lng: 126.9780, population: 9770000 },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', region: 'Asia', lat: 13.7563, lng: 100.5018, population: 10500000 },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'Asia', lat: 1.3521, lng: 103.8198, population: 5700000 },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'Europe', lat: 51.5074, lng: -0.1278, population: 8980000 },
  { name: 'Paris', country: 'France', countryCode: 'FR', region: 'Europe', lat: 48.8566, lng: 2.3522, population: 2160000 },
  { name: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'Europe', lat: 52.5200, lng: 13.4050, population: 3640000 },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', region: 'Europe', lat: 41.9028, lng: 12.4964, population: 2870000 },
  { name: 'Madrid', country: 'Spain', countryCode: 'ES', region: 'Europe', lat: 40.4168, lng: -3.7038, population: 3220000 },
  { name: 'Moscow', country: 'Russia', countryCode: 'RU', region: 'Europe', lat: 55.7558, lng: 37.6173, population: 12500000 },
  { name: 'New York', country: 'United States', countryCode: 'US', region: 'Americas', lat: 40.7128, lng: -74.0060, population: 8400000 },
  { name: 'Los Angeles', country: 'United States', countryCode: 'US', region: 'Americas', lat: 34.0522, lng: -118.2437, population: 3900000 },
  { name: 'Sao Paulo', country: 'Brazil', countryCode: 'BR', region: 'Americas', lat: -23.5505, lng: -46.6333, population: 12300000 },
  { name: 'Mexico City', country: 'Mexico', countryCode: 'MX', region: 'Americas', lat: 19.4326, lng: -99.1332, population: 9200000 },
  { name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', region: 'Americas', lat: -34.6037, lng: -58.3816, population: 3100000 },
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', region: 'Americas', lat: 43.6532, lng: -79.3832, population: 2900000 },
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', region: 'Africa', lat: 30.0444, lng: 31.2357, population: 20900000 },
  { name: 'Lagos', country: 'Nigeria', countryCode: 'NG', region: 'Africa', lat: 6.5244, lng: 3.3792, population: 14800000 },
  { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', region: 'Africa', lat: -1.2921, lng: 36.8219, population: 4700000 },
  { name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', region: 'Africa', lat: -33.9249, lng: 18.4241, population: 4600000 },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', region: 'Oceania', lat: -33.8688, lng: 151.2093, population: 5300000 },
  { name: 'Melbourne', country: 'Australia', countryCode: 'AU', region: 'Oceania', lat: -37.8136, lng: 144.9631, population: 5100000 },
  { name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', region: 'Oceania', lat: -36.8485, lng: 174.7633, population: 1650000 },
];

export async function fetchCountries(): Promise<Country[]> {
  try {
    const res = await fetch(`${BASE_URLS.REST_COUNTRIES}/all?fields=name,cca2,capital,region,population,latlng,flags`);
    const data = await res.json();

    return data
      .filter((c: any) => c.capital && c.capital.length > 0)
      .map((c: any) => ({
        name: c.name.common,
        code: c.cca2,
        capital: c.capital[0],
        region: c.region || 'Unknown',
        population: c.population || 0,
        flag: c.flags?.svg || c.flags?.png || '',
        lat: c.latlng?.[0] || 0,
        lng: c.latlng?.[1] || 0,
      }))
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
  } catch {
    return getFallbackCountries();
  }
}

export async function searchCities(query: string): Promise<City[]> {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return MAJOR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
  ).slice(0, 10);
}

export function getCitiesByRegion(region: string): City[] {
  if (region === 'All') return MAJOR_CITIES;
  return MAJOR_CITIES.filter((c) => c.region === region);
}

function getFallbackCountries(): Country[] {
  const fallback = [
    { name: 'Philippines', code: 'PH', capital: 'Manila', region: 'Asia', population: 110000000, flag: '', lat: 14.5995, lng: 120.9842 },
    { name: 'United States', code: 'US', capital: 'Washington DC', region: 'Americas', population: 331000000, flag: '', lat: 38.9072, lng: -77.0369 },
    { name: 'United Kingdom', code: 'GB', capital: 'London', region: 'Europe', population: 67000000, flag: '', lat: 51.5074, lng: -0.1278 },
    { name: 'Japan', code: 'JP', capital: 'Tokyo', region: 'Asia', population: 125000000, flag: '', lat: 35.6762, lng: 139.6503 },
    { name: 'Germany', code: 'DE', capital: 'Berlin', region: 'Europe', population: 83000000, flag: '', lat: 52.5200, lng: 13.4050 },
    { name: 'Brazil', code: 'BR', capital: 'Brasilia', region: 'Americas', population: 213000000, flag: '', lat: -15.7975, lng: -47.8919 },
    { name: 'Australia', code: 'AU', capital: 'Canberra', region: 'Oceania', population: 25600000, flag: '', lat: -35.2809, lng: 149.1300 },
    { name: 'Egypt', code: 'EG', capital: 'Cairo', region: 'Africa', population: 102000000, flag: '', lat: 30.0444, lng: 31.2357 },
  ];
  return fallback;
}
