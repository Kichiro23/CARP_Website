import { useState, useEffect } from 'react';
import { Trophy, Wind, Droplets, Sun, MapPin, Zap, Search } from 'lucide-react';
import { wmoEmoji, wmoDescription, geocodeCity } from '@/services/weatherApi';

interface City {
  name: string;
  lat: number;
  lon: number;
  country?: string;
}

const CITIES: City[] = [
  { name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'Philippines' },
  { name: 'Cebu', lat: 10.3157, lon: 123.8854, country: 'Philippines' },
  { name: 'Davao', lat: 7.1907, lon: 125.4553, country: 'Philippines' },
  { name: 'Baguio', lat: 16.4023, lon: 120.5960, country: 'Philippines' },
  { name: 'Quezon City', lat: 14.6760, lon: 121.0437, country: 'Philippines' },
  { name: 'Makati', lat: 14.5547, lon: 121.0244, country: 'Philippines' },
  { name: 'Iloilo', lat: 10.7202, lon: 122.5621, country: 'Philippines' },
  { name: 'Cagayan de Oro', lat: 8.4542, lon: 124.6319, country: 'Philippines' },
];

interface CityWeather {
  city: City;
  temp: number;
  wind: number;
  humidity: number;
  weatherCode: number;
  uv: number;
}

let globalCache: Record<string, CityWeather> = {};

async function fetchCityWeather(city: City): Promise<CityWeather | null> {
  const key = city.lat + ',' + city.lon;
  if (globalCache[key]) return globalCache[key];
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + city.lat + '&longitude=' + city.lon + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=uv_index_max&timezone=auto';
    const res = await fetch(url);
    const data = await res.json();
    const result = {
      city,
      temp: data.current?.temperature_2m ?? 0,
      wind: data.current?.wind_speed_10m ?? 0,
      humidity: data.current?.relative_humidity_2m ?? 0,
      weatherCode: data.current?.weather_code ?? 0,
      uv: data.daily?.uv_index_max?.[0] ?? 0,
    };
    globalCache[key] = result;
    return result;
  } catch { return null; }
}

export default function CityBattle() {
  const [selected1, setSelected1] = useState<City>(CITIES[0]);
  const [selected2, setSelected2] = useState<City>(CITIES[1]);
  const [w1, setW1] = useState<CityWeather | null>(null);
  const [w2, setW2] = useState<CityWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<CityWeather[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<City[] | null>(null);
  const [searching, setSearching] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const results = await Promise.all(CITIES.map(c => fetchCityWeather(c)));
    setAllData(results.filter(Boolean) as CityWeather[]);
    setLoading(false);
  };

  const loadCompare = async () => {
    setLoading(true);
    const [a, b] = await Promise.all([fetchCityWeather(selected1), fetchCityWeather(selected2)]);
    setW1(a);
    setW2(b);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const result = await geocodeCity(search.trim());
    if (result) {
      const newCity: City = { name: result.name, lat: result.lat, lon: result.lon, country: result.country };
      setSearchResults([newCity]);
    } else {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const addSearchedCity = (city: City) => {
    const exists = CITIES.find(c => c.name === city.name);
    if (!exists) {
      CITIES.push(city);
    }
    setSelected2(city);
    setSearchResults(null);
    setSearch('');
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadCompare(); }, [selected1, selected2]);

  const score = (w: CityWeather) => {
    let s = 0;
    if (w.temp >= 25 && w.temp <= 32) s += 3;
    else if (w.temp < 25) s += 2;
    else s += 1;
    if (w.humidity >= 40 && w.humidity <= 70) s += 2;
    else s += 1;
    if (w.wind <= 15) s += 2;
    else s += 1;
    if (w.weatherCode <= 3) s += 3;
    else if (w.weatherCode <= 48) s += 2;
    else s += 1;
    if (w.uv <= 8) s += 2;
    else s += 1;
    return s;
  };

  const winner = w1 && w2 ? (score(w1) >= score(w2) ? w1 : w2) : null;

  const sorted = [...allData].sort((a, b) => score(b) - score(a));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>City Battle</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Compare real weather across cities worldwide</p>
      </div>

      <div className="tile">
        <label className="block text-[11px] font-bold mb-2" style={{ color: 'var(--text)' }}>Search a City or Country</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Tokyo, Paris, New York..."
            className="glass-input flex-1"
          />
          <button onClick={handleSearch} disabled={searching} className="glass-btn px-4 py-2 text-xs">
            <Search className="h-3 w-3" /> Search
          </button>
        </div>
        {searching && <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Searching...</p>}
        {searchResults && (searchResults.length > 0 ? (
          <div className="mt-2 space-y-1">
            {searchResults.map(c => (
              <button key={c.name} onClick={() => addSearchedCity(c)} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl border text-sm hover:brightness-110 transition" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text)' }}>
                <MapPin className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                <span>{c.name}, {c.country} - Click to add to battle</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>No cities found. Try a different search.</p>
        ))}
      </div>

      <div className="tile">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <select value={selected1.name} onChange={e => setSelected1(CITIES.find(c => c.name === e.target.value)!)} className="w-full glass-select mb-3 text-sm">
              {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            {w1 ? (
              <div className="text-center">
                <p className="text-3xl">{wmoEmoji(w1.weatherCode)}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{w1.temp}&deg;C</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{wmoDescription(w1.weatherCode)}</p>
              </div>
            ) : <div className="skeleton h-20 w-full" />}
          </div>
          <div>
            <select value={selected2.name} onChange={e => setSelected2(CITIES.find(c => c.name === e.target.value)!)} className="w-full glass-select mb-3 text-sm">
              {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            {w2 ? (
              <div className="text-center">
                <p className="text-3xl">{wmoEmoji(w2.weatherCode)}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{w2.temp}&deg;C</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{wmoDescription(w2.weatherCode)}</p>
              </div>
            ) : <div className="skeleton h-20 w-full" />}
          </div>
        </div>

        {winner && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ background: 'var(--accent)' }}>
              <Trophy className="h-4 w-4" /> {winner.city.name} wins with score {score(winner)}!
            </div>
          </div>
        )}

        {w1 && w2 && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-blue-400" /><span>{w1.wind} vs {w2.wind} km/h</span></div>
            <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-400" /><span>{w1.humidity}% vs {w2.humidity}%</span></div>
            <div className="flex items-center gap-2"><Sun className="h-4 w-4 text-yellow-400" /><span>UV {w1.uv} vs {w2.uv}</span></div>
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-orange-400" /><span>Score {score(w1)} vs {score(w2)}</span></div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Weather Leaderboard</h2>
        <div className="space-y-1.5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="tile"><div className="skeleton h-10 w-full" /></div>)
          ) : sorted.map((w, i) => (
            <div key={w.city.name} className="tile flex items-center gap-3">
              <div className={'w-6 text-center text-sm font-bold ' + (i === 0 ? 'text-yellow-400 ' : i === 1 ? 'text-gray-400 ' : i === 2 ? 'text-amber-600 ' : '')} style={{ color: i > 2 ? 'var(--text-muted)' : undefined }}>#{i + 1}</div>
              <MapPin className="h-4 w-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{w.city.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{wmoDescription(w.weatherCode)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{w.temp}&deg;</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{score(w)} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
