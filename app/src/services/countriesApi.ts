import type { CountryData } from '@/types';

const CACHE_KEY = 'carp_countries_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getCache(): CountryData[] | null {
  try { const raw = localStorage.getItem(CACHE_KEY); if (!raw) return null; const { data, ts } = JSON.parse(raw); if (Date.now() - ts > CACHE_TTL) return null; return Array.isArray(data) ? data : null; } catch { return null; }
}
function setCache(data: CountryData[]) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {} }

export async function fetchCountries(): Promise<CountryData[]> {
  const cached = getCache(); if (cached) return cached;
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,population,latlng,cca2');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const countries: CountryData[] = data.map((c: any) => ({
      name: c.name.common, code: c.cca2, capital: c.capital?.[0] || 'N/A',
      flag: c.flags?.svg || c.flags?.png || '', population: c.population,
      lat: c.latlng?.[0] || 0, lon: c.latlng?.[1] || 0,
    })).sort((a: CountryData, b: CountryData) => a.name.localeCompare(b.name));
    setCache(countries); return countries;
  } catch { return getCache() || []; }
}

export async function searchCountry(query: string): Promise<CountryData | null> {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,capital,flags,population,latlng,cca2`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.length) return null;
    const c = data[0];
    return { name: c.name.common, code: c.cca2, capital: c.capital?.[0] || 'N/A', flag: c.flags?.svg || c.flags?.png || '', population: c.population, lat: c.latlng?.[0] || 0, lon: c.latlng?.[1] || 0 };
  } catch { return null; }
}
