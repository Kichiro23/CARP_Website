/**
 * Philippine Cities API Service
 * Uses OpenStreetMap Nominatim for free geocoding
 * Caches results in localStorage for performance
 */

import { geocodeCity } from './weatherApi';

export interface PhCity {
  name: string;
  region: string; // NCR, Luzon, Visayas, Mindanao
  province: string;
  lat: number;
  lon: number;
  type: 'city' | 'municipality';
}

const CACHE_KEY = 'carp_ph_cities_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Core Philippine cities that must always be available (fast, no API needed)
const CORE_PH_CITIES: PhCity[] = [
  // NCR
  { name: 'Manila', region: 'NCR', province: 'Metro Manila', lat: 14.5995, lon: 120.9842, type: 'city' },
  { name: 'Quezon City', region: 'NCR', province: 'Metro Manila', lat: 14.6760, lon: 121.0437, type: 'city' },
  { name: 'Makati', region: 'NCR', province: 'Metro Manila', lat: 14.5547, lon: 121.0244, type: 'city' },
  { name: 'Pasig', region: 'NCR', province: 'Metro Manila', lat: 14.5764, lon: 121.0851, type: 'city' },
  { name: 'Taguig', region: 'NCR', province: 'Metro Manila', lat: 14.5176, lon: 121.0509, type: 'city' },
  { name: 'Caloocan', region: 'NCR', province: 'Metro Manila', lat: 14.6492, lon: 120.9818, type: 'city' },
  { name: 'Paranaque', region: 'NCR', province: 'Metro Manila', lat: 14.4793, lon: 121.0198, type: 'city' },
  { name: 'Las Pinas', region: 'NCR', province: 'Metro Manila', lat: 14.4445, lon: 120.9939, type: 'city' },
  { name: 'Marikina', region: 'NCR', province: 'Metro Manila', lat: 14.6507, lon: 121.1029, type: 'city' },
  { name: 'Valenzuela', region: 'NCR', province: 'Metro Manila', lat: 14.7011, lon: 120.9830, type: 'city' },
  { name: 'Muntinlupa', region: 'NCR', province: 'Metro Manila', lat: 14.4081, lon: 121.0415, type: 'city' },
  { name: 'Mandaluyong', region: 'NCR', province: 'Metro Manila', lat: 14.5794, lon: 121.0359, type: 'city' },
  { name: 'San Juan', region: 'NCR', province: 'Metro Manila', lat: 14.5995, lon: 121.0351, type: 'city' },
  { name: 'Pasay', region: 'NCR', province: 'Metro Manila', lat: 14.5378, lon: 121.0014, type: 'city' },
  { name: 'Malabon', region: 'NCR', province: 'Metro Manila', lat: 14.6680, lon: 120.9658, type: 'city' },
  { name: 'Navotas', region: 'NCR', province: 'Metro Manila', lat: 14.7121, lon: 120.9443, type: 'city' },
  // Luzon
  { name: 'Malolos', region: 'Luzon', province: 'Bulacan', lat: 14.8443, lon: 120.8104, type: 'city' },
  { name: 'San Jose del Monte', region: 'Luzon', province: 'Bulacan', lat: 14.8139, lon: 121.0453, type: 'city' },
  { name: 'Baliuag', region: 'Luzon', province: 'Bulacan', lat: 14.9543, lon: 120.8967, type: 'municipality' },
  { name: 'Angeles', region: 'Luzon', province: 'Pampanga', lat: 15.1457, lon: 120.5647, type: 'city' },
  { name: 'San Fernando', region: 'Luzon', province: 'Pampanga', lat: 15.0347, lon: 120.6819, type: 'city' },
  { name: 'Mabalacat', region: 'Luzon', province: 'Pampanga', lat: 15.2214, lon: 120.5743, type: 'city' },
  { name: 'Bacoor', region: 'Luzon', province: 'Cavite', lat: 14.4624, lon: 120.9295, type: 'city' },
  { name: 'Dasmarinas', region: 'Luzon', province: 'Cavite', lat: 14.3294, lon: 120.9367, type: 'city' },
  { name: 'Imus', region: 'Luzon', province: 'Cavite', lat: 14.4296, lon: 120.9367, type: 'city' },
  { name: 'Trece Martires', region: 'Luzon', province: 'Cavite', lat: 14.2805, lon: 120.8670, type: 'city' },
  { name: 'Calamba', region: 'Luzon', province: 'Laguna', lat: 14.2117, lon: 121.1653, type: 'city' },
  { name: 'Santa Rosa', region: 'Luzon', province: 'Laguna', lat: 14.3124, lon: 121.0290, type: 'city' },
  { name: 'Biñan', region: 'Luzon', province: 'Laguna', lat: 14.3383, lon: 121.0832, type: 'city' },
  { name: 'San Pedro', region: 'Luzon', province: 'Laguna', lat: 14.3641, lon: 121.0564, type: 'city' },
  { name: 'Cabuyao', region: 'Luzon', province: 'Laguna', lat: 14.2753, lon: 121.1251, type: 'city' },
  { name: 'Batangas City', region: 'Luzon', province: 'Batangas', lat: 13.7565, lon: 121.0583, type: 'city' },
  { name: 'Lipa', region: 'Luzon', province: 'Batangas', lat: 13.9414, lon: 121.1642, type: 'city' },
  { name: 'Calapan', region: 'Luzon', province: 'Oriental Mindoro', lat: 13.4130, lon: 121.1810, type: 'city' },
  { name: 'Baguio', region: 'Luzon', province: 'Benguet', lat: 16.4023, lon: 120.5960, type: 'city' },
  { name: 'Dagupan', region: 'Luzon', province: 'Pangasinan', lat: 16.0433, lon: 120.3333, type: 'city' },
  { name: 'Urdaneta', region: 'Luzon', province: 'Pangasinan', lat: 15.9758, lon: 120.5710, type: 'city' },
  { name: 'Vigan', region: 'Luzon', province: 'Ilocos Sur', lat: 17.5745, lon: 120.3870, type: 'city' },
  { name: 'Laoag', region: 'Luzon', province: 'Ilocos Norte', lat: 18.1960, lon: 120.5920, type: 'city' },
  { name: 'Tuguegarao', region: 'Luzon', province: 'Cagayan', lat: 17.6131, lon: 121.7269, type: 'city' },
  { name: 'Olongapo', region: 'Luzon', province: 'Zambales', lat: 14.8386, lon: 120.2842, type: 'city' },
  { name: 'Tarlac City', region: 'Luzon', province: 'Tarlac', lat: 15.4802, lon: 120.5979, type: 'city' },
  { name: 'Cabanatuan', region: 'Luzon', province: 'Nueva Ecija', lat: 15.4866, lon: 120.9734, type: 'city' },
  { name: 'Gapan', region: 'Luzon', province: 'Nueva Ecija', lat: 15.3072, lon: 120.9464, type: 'city' },
  { name: 'Antipolo', region: 'Luzon', province: 'Rizal', lat: 14.6255, lon: 121.1245, type: 'city' },
  { name: 'Binangonan', region: 'Luzon', province: 'Rizal', lat: 14.4646, lon: 121.1920, type: 'municipality' },
  { name: 'Lucena', region: 'Luzon', province: 'Quezon', lat: 13.9280, lon: 121.6156, type: 'city' },
  { name: 'Tayabas', region: 'Luzon', province: 'Quezon', lat: 14.0259, lon: 121.5929, type: 'city' },
  { name: 'Legazpi', region: 'Luzon', province: 'Albay', lat: 13.1391, lon: 123.7438, type: 'city' },
  { name: 'Naga', region: 'Luzon', province: 'Camarines Sur', lat: 13.6218, lon: 123.1948, type: 'city' },
  // Visayas
  { name: 'Cebu City', region: 'Visayas', province: 'Cebu', lat: 10.3157, lon: 123.8854, type: 'city' },
  { name: 'Mandaue', region: 'Visayas', province: 'Cebu', lat: 10.3238, lon: 123.9220, type: 'city' },
  { name: 'Lapu-Lapu', region: 'Visayas', province: 'Cebu', lat: 10.2660, lon: 123.9975, type: 'city' },
  { name: 'Talisay', region: 'Visayas', province: 'Cebu', lat: 10.2443, lon: 123.8334, type: 'city' },
  { name: 'Iloilo City', region: 'Visayas', province: 'Iloilo', lat: 10.7202, lon: 122.5621, type: 'city' },
  { name: 'Bacolod', region: 'Visayas', province: 'Negros Occidental', lat: 10.6400, lon: 122.9680, type: 'city' },
  { name: 'Tacloban', region: 'Visayas', province: 'Leyte', lat: 11.2543, lon: 125.0008, type: 'city' },
  { name: 'Dumaguete', region: 'Visayas', province: 'Negros Oriental', lat: 9.3068, lon: 123.3054, type: 'city' },
  { name: 'Roxas City', region: 'Visayas', province: 'Capiz', lat: 11.5853, lon: 122.7511, type: 'city' },
  { name: 'Kalibo', region: 'Visayas', province: 'Aklan', lat: 11.7100, lon: 122.3644, type: 'municipality' },
  { name: 'Tagbilaran', region: 'Visayas', province: 'Bohol', lat: 9.6729, lon: 123.8730, type: 'city' },
  // Mindanao
  { name: 'Davao City', region: 'Mindanao', province: 'Davao del Sur', lat: 7.1907, lon: 125.4553, type: 'city' },
  { name: 'Panabo', region: 'Mindanao', province: 'Davao del Norte', lat: 7.3080, lon: 125.6840, type: 'city' },
  { name: 'Tagum', region: 'Mindanao', province: 'Davao del Norte', lat: 7.4478, lon: 125.8072, type: 'city' },
  { name: 'Cagayan de Oro', region: 'Mindanao', province: 'Misamis Oriental', lat: 8.4542, lon: 124.6319, type: 'city' },
  { name: 'Zamboanga City', region: 'Mindanao', province: 'Zamboanga del Sur', lat: 6.9214, lon: 122.0790, type: 'city' },
  { name: 'General Santos', region: 'Mindanao', province: 'South Cotabato', lat: 6.1164, lon: 125.1716, type: 'city' },
  { name: 'Butuan', region: 'Mindanao', province: 'Agusan del Norte', lat: 8.9475, lon: 125.5406, type: 'city' },
  { name: 'Iligan', region: 'Mindanao', province: 'Lanao del Norte', lat: 8.2280, lon: 124.2383, type: 'city' },
  { name: 'Malaybalay', region: 'Mindanao', province: 'Bukidnon', lat: 8.1575, lon: 125.1278, type: 'city' },
  { name: 'Valencia', region: 'Mindanao', province: 'Bukidnon', lat: 7.9280, lon: 125.0950, type: 'city' },
  { name: 'Koronadal', region: 'Mindanao', province: 'South Cotabato', lat: 6.5000, lon: 124.8500, type: 'city' },
  { name: 'Tacurong', region: 'Mindanao', province: 'Sultan Kudarat', lat: 6.6920, lon: 124.6764, type: 'city' },
  { name: 'Cotabato City', region: 'Mindanao', province: 'Maguindanao', lat: 7.2164, lon: 124.2464, type: 'city' },
  { name: 'Digos', region: 'Mindanao', province: 'Davao del Sur', lat: 6.7497, lon: 125.3570, type: 'city' },
  { name: 'Mati', region: 'Mindanao', province: 'Davao Oriental', lat: 6.9551, lon: 126.2166, type: 'city' },
  { name: 'Ozamiz', region: 'Mindanao', province: 'Misamis Occidental', lat: 8.1462, lon: 123.8444, type: 'city' },
  { name: 'Pagadian', region: 'Mindanao', province: 'Zamboanga del Sur', lat: 7.8256, lon: 123.4369, type: 'city' },
  { name: 'Surigao City', region: 'Mindanao', province: 'Surigao del Norte', lat: 9.7840, lon: 125.4890, type: 'city' },
];

function getCache(): { cities: PhCity[]; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed;
  } catch { return null; }
}

function setCache(cities: PhCity[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ cities, timestamp: Date.now() }));
}

/**
 * Get all Philippine cities — uses cached core list for instant results
 */
export function getAllPhCities(): PhCity[] {
  const cached = getCache();
  if (cached) return cached.cities;
  // Return core list immediately, cache it
  setCache(CORE_PH_CITIES);
  return CORE_PH_CITIES;
}

/**
 * Search Philippine cities by name (real-time filtering)
 */
export function searchPhCities(query: string): PhCity[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const cities = getAllPhCities();
  return cities.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.province.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
  );
}

/**
 * Get cities by region
 */
export function getCitiesByRegion(region: string): PhCity[] {
  const cities = getAllPhCities();
  if (region === 'All') return cities;
  return cities.filter((c) => c.region === region);
}

/**
 * Get all available regions
 */
export function getPhRegions(): string[] {
  return ['All', 'NCR', 'Luzon', 'Visayas', 'Mindanao'];
}

/**
 * Fetch additional city data from Nominatim API (geocoding fallback)
 */
export async function fetchCityFromNominatim(
  cityName: string
): Promise<PhCity | null> {
  try {
    const geo = await geocodeCity(cityName);
    if (!geo) return null;
    return {
      name: cityName,
      region: 'Luzon',
      province: '',
      lat: geo.lat,
      lon: geo.lon,
      type: 'city',
    };
  } catch {
    return null;
  }
}
