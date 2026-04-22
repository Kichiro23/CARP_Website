import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, RefreshCw, Navigation, X } from 'lucide-react';
import { fetchWeather, fetchPM25, wmoEmoji, wmoLabel, aqiColor } from '@/services/weatherApi';
import CitySearch from '@/components/CitySearch';
import type { SavedLocation } from '@/hooks/useLocation';
import type { WeatherData } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const aqiMarkerColors = ['#5CB85C', '#F0AD4E', '#E87040', '#D9534F', '#9B59B6'];

function createMarkerIcon(pm25: number | null) {
  const color = pm25 !== null ? aqiMarkerColors[Math.min(4, Math.max(0, pm25 <= 12 ? 0 : pm25 <= 35 ? 1 : pm25 <= 55 ? 2 : pm25 <= 150 ? 3 : 4))] : '#6b6f7a';
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color}20;border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#EAEFEF;backdrop-filter:blur(4px);box-shadow:0 2px 8px rgba(0,0,0,0.3);">${pm25 !== null ? Math.round(pm25) : '?'}</div>`,
  });
}

function MapController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 10); }, [lat, lng, map]);
  return null;
}

const MAJOR_CITIES = [
  // Philippines
  'Manila, Philippines', 'Quezon City, Philippines', 'Cebu City, Philippines', 'Davao City, Philippines',
  'Baguio, Philippines', 'Iloilo City, Philippines', 'Bacolod, Philippines', 'Cagayan de Oro, Philippines',
  'Zamboanga City, Philippines', 'Tacloban, Philippines', 'General Santos, Philippines', 'Dagupan, Philippines',
  'Naga, Philippines', 'Legazpi, Philippines', 'Puerto Princesa, Philippines', 'Tagaytay, Philippines',
  'Batangas City, Philippines', 'Lucena, Philippines',
  // Bulacan
  'Malolos, Philippines', 'Meycauayan, Philippines', 'San Jose del Monte, Philippines', 'Santa Maria, Philippines',
  'Marilao, Philippines', 'Bocaue, Philippines', 'Baliuag, Philippines', 'Plaridel, Philippines',
  'Pulilan, Philippines', 'Hagonoy, Philippines', 'Calumpit, Philippines', 'Guiguinto, Philippines',
  'Bulakan, Philippines', 'Paombong, Philippines', 'Pandi, Philippines', 'Angat, Philippines',
  'Norzagaray, Philippines', 'San Miguel, Philippines', 'San Ildefonso, Philippines',
  // Pampanga
  'Angeles, Philippines', 'Mabalacat, Philippines', 'Magalang, Philippines', 'Arayat, Philippines',
  'Mexico, Philippines', 'Apalit, Philippines', 'Macabebe, Philippines', 'Masantol, Philippines',
  'Guagua, Philippines', 'Lubao, Philippines', 'Floridablanca, Philippines', 'Porac, Philippines',
  'Sasmuan, Philippines', 'Candaba, Philippines', 'San Luis, Philippines', 'Bacolor, Philippines',
  'Minalin, Philippines', 'Santo Tomas, Philippines',
  // Asia
  'Tokyo, Japan', 'Seoul, South Korea', 'Beijing, China', 'Hong Kong',
  'Bangkok, Thailand', 'Jakarta, Indonesia', 'Singapore', 'Kuala Lumpur, Malaysia',
  'Hanoi, Vietnam', 'Taipei, Taiwan', 'Mumbai, India', 'Karachi, Pakistan',
  'Dhaka, Bangladesh', 'Dubai, UAE', 'Riyadh, Saudi Arabia', 'Tehran, Iran',
  'Istanbul, Turkey', 'Moscow, Russia',
  // Europe
  'London, UK', 'Paris, France', 'Berlin, Germany', 'Rome, Italy',
  'Madrid, Spain', 'Amsterdam, Netherlands', 'Vienna, Austria', 'Warsaw, Poland',
  // Americas
  'New York, USA', 'Los Angeles, USA', 'Toronto, Canada', 'Mexico City, Mexico',
  'Sao Paulo, Brazil', 'Buenos Aires, Argentina',
  // Oceania & Africa
  'Sydney, Australia', 'Melbourne, Australia', 'Auckland, New Zealand',
  'Cairo, Egypt', 'Nairobi, Kenya', 'Lagos, Nigeria', 'Cape Town, South Africa',
];

const STORAGE_KEY = 'carp_map_cities';

interface CityMarker { name: string; lat: number; lng: number; weather: WeatherData | null; pm25: number | null; isCustom?: boolean; }

interface Props { current: SavedLocation; }

export default function LiveMap({ current }: Props) {
  const [markers, setMarkers] = useState<CityMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([current.lat, current.lng]);

  useEffect(() => { setCenter([current.lat, current.lng]); }, [current.lat, current.lng]);

  const getCustomCities = (): string[] => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  };
  const saveCustomCities = (cities: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  };

  const loadCity = async (cityName: string, isCustom = false): Promise<CityMarker | null> => {
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results?.[0]) return null;
      const r = geoData.results[0];
      const [w, pm25] = await Promise.all([fetchWeather(r.latitude, r.longitude), fetchPM25(r.latitude, r.longitude)]);
      return { name: r.name, lat: r.latitude, lng: r.longitude, weather: w, pm25, isCustom };
    } catch { return null; }
  };

  const load = async () => {
    setLoading(true);
    const custom = getCustomCities();
    const allCities = [...MAJOR_CITIES, ...custom];
    const results: CityMarker[] = [];
    await Promise.all(allCities.map(async (city) => {
      const marker = await loadCity(city, custom.includes(city));
      if (marker) results.push(marker);
    }));
    setMarkers(results);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearchSelect = async (city: { name: string; country: string; lat: number; lng: number }) => {
    const cityLabel = `${city.name}, ${city.country}`;
    const custom = getCustomCities();
    if (custom.includes(cityLabel) || markers.some(m => m.name === city.name)) return;

    const marker = await loadCity(cityLabel, true);
    if (marker) {
      setMarkers(prev => [...prev, marker]);
      saveCustomCities([...custom, cityLabel]);
      setCenter([city.lat, city.lng]);
    }
  };

  const removeCustomCity = (name: string) => {
    const custom = getCustomCities();
    const updated = custom.filter(c => !c.startsWith(name));
    saveCustomCities(updated);
    setMarkers(prev => prev.filter(m => !(m.isCustom && m.name === name)));
  };

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => setCenter([pos.coords.latitude, pos.coords.longitude]), () => {});
    }
  };

  return (
    <div className="flex h-full flex-col -m-4 md:-m-6">
      <div className="shrink-0 p-4 md:p-6 pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Live Map</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />{current.name} &middot; Global air quality stations</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={locateMe} className="glass-badge cursor-pointer"><Navigation className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Locate</button>
            <button onClick={load} className="glass-badge cursor-pointer"><RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> {loading ? 'Loading...' : 'Refresh'}</button>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-72">
            <CitySearch onSelect={handleSearchSelect} placeholder="Search any city or country..." />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {['Good', 'Moderate', 'Unhealthy(S)', 'Unhealthy', 'Hazardous'].map((l, i) => (
              <div key={l} className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full" style={{ background: aqiMarkerColors[i] }} /><span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{l}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 mx-4 md:mx-6 mb-4 md:mb-6 min-h-[400px] rounded-xl overflow-hidden border" style={{ borderColor: 'var(--tile-border)' }}>
        <MapContainer center={center} zoom={10} scrollWheelZoom style={{ height: '100%', width: '100%', background: '#1a1a2e' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapController lat={center[0]} lng={center[1]} />
          <Marker position={[current.lat, current.lng]} icon={L.divIcon({
            className: '', iconSize: [40, 40], iconAnchor: [20, 40],
            html: `<div style="width:40px;height:40px;border-radius:50%;background:#EA9D6330;border:3px solid #EA9D63;display:flex;align-items:center;justify-content:center;font-size:16px;animation:pulse 2s infinite;">&#x1F4CD;</div>`,
          })}>
            <Popup><div className="min-w-[120px]"><p className="text-xs font-bold" style={{ color: '#EAEFEF' }}>{current.name}</p><p className="text-[10px]" style={{ color: '#9a9da8' }}>Your selected location</p></div></Popup>
          </Marker>
          {markers.map(m => (
            <Marker key={`${m.name}-${m.lat}`} position={[m.lat, m.lng]} icon={createMarkerIcon(m.pm25)}>
              <Popup>
                <div className="min-w-[140px]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold mb-1" style={{ color: '#EAEFEF' }}>{m.name}</h4>
                    {m.isCustom && (
                      <button onClick={() => removeCustomCity(m.name)} className="ml-2 rounded p-0.5 hover:bg-white/10" title="Remove">
                        <X className="h-3 w-3" style={{ color: '#9a9da8' }} />
                      </button>
                    )}
                  </div>
                  {m.weather ? (
                    <div className="space-y-0.5">
                      <p className="text-[11px]" style={{ color: '#9a9da8' }}>{wmoEmoji(m.weather.current.weatherCode)} {m.weather.current.temperature}C | {m.weather.current.humidity}%</p>
                      <p className="text-[11px]" style={{ color: m.pm25 !== null ? aqiColor(m.pm25) : '#9a9da8' }}>PM2.5: {m.pm25 ?? '--'} &middot; {wmoLabel(m.weather.current.weatherCode)}</p>
                    </div>
                  ) : <p className="text-[10px]" style={{ color: '#6b6f7a' }}>No data</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
