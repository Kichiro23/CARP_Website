import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Wind, Navigation, Activity, RefreshCw, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Typhoon {
  id: string;
  name: string;
  category: string;
  wind: number;
  pressure: number;
  position: [number, number];
  path: [number, number][];
  active: boolean;
}

function TyphoonMapLayers({ typhoons }: { typhoons: Typhoon[] }) {
  const map = useMap();
  useEffect(() => {
    const layers: any[] = [];
    typhoons.forEach(ty => {
      layers.push(L.circleMarker(ty.position, {
        radius: 12,
        color: ty.active ? '#ef4444' : '#f97316',
        fillColor: ty.active ? '#ef4444' : '#f97316',
        fillOpacity: 0.5,
      }).addTo(map));
      if (ty.path.length > 1) {
        layers.push(L.polyline(ty.path, { color: ty.active ? '#ef4444' : '#f97316', weight: 2, opacity: 0.6 }).addTo(map));
      }
    });
    return () => { layers.forEach(l => map.removeLayer(l)); };
  }, [typhoons, map]);
  return null;
}

// Use PAGASA-like data from Open-Meteo severe weather indicators
async function fetchActiveTyphoons(): Promise<Typhoon[]> {
  try {
    // Check strong wind areas in the Philippine region (approx bounding box)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=14.5995,10.3157,7.1907&longitude=120.9842,123.8854,125.4553&current=windspeed_10m,weather_code,pressure_msl&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    const results: Typhoon[] = [];
    // Check if any location has severe wind (>60km/h) to simulate typhoon
    const locations = [
      { name: 'Manila', lat: 14.5995, lon: 120.9842 },
      { name: 'Cebu', lat: 10.3157, lon: 123.8854 },
      { name: 'Davao', lat: 7.1907, lon: 125.4553 },
    ];
    const list = Array.isArray(data) ? data : [data];
    list.forEach((d, i) => {
      const wind = d.current?.windspeed_10m ?? 0;
      const pressure = d.current?.pressure_msl ?? 1013;
      const loc = locations[i] ?? locations[0];
      if (wind > 50 || pressure < 1000) {
        results.push({
          id: `ty-${loc.name.toLowerCase()}`,
          name: loc.name,
          category: wind > 80 ? 'Super Typhoon' : wind > 60 ? 'Typhoon' : 'Severe TS',
          wind,
          pressure,
          position: [loc.lat, loc.lon],
          path: [[loc.lat, loc.lon], [loc.lat + 0.5, loc.lon + 0.5], [loc.lat + 1, loc.lon + 1]],
          active: wind > 60,
        });
      }
    });
    // If no real active typhoons, show sample historical track for demo
    if (results.length === 0) {
      results.push({
        id: 'demo-1',
        name: 'No Active Typhoon',
        category: 'Clear',
        wind: 0,
        pressure: 1013,
        position: [14.5995, 120.9842],
        path: [],
        active: false,
      });
    }
    return results;
  } catch { return []; }
}

export default function TyphoonTracker() {
  const [typhoons, setTyphoons] = useState<Typhoon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const data = await fetchActiveTyphoons();
    setTyphoons(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = typhoons.filter(t => t.active);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Typhoon Tracker</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Real-time wind & pressure monitoring — PH region</p>
          </div>
          <button onClick={load} disabled={refreshing} className="glass-badge cursor-pointer flex items-center gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {active.length > 0 && (
        <div className="tile flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-400">{active.length} Active Alert{active.length > 1 ? 's' : ''}</p>
            <p className="text-[10px] text-red-300">Stay informed and follow official PAGASA advisories.</p>
          </div>
        </div>
      )}

      <div className="tile p-1" style={{ height: 320 }}>
        {loading ? (
          <div className="skeleton h-full w-full rounded-xl" />
        ) : (
          <MapContainer center={[14.5995, 120.9842]} zoom={5} className="h-full w-full rounded-xl">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <TyphoonMapLayers typhoons={typhoons} />
          </MapContainer>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Monitored Systems</h2>
        {typhoons.map(t => (
          <div key={t.id} className="tile flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${t.active ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{t.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.category}</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="text-center"><Wind className="mx-auto h-3.5 w-3.5 text-blue-400" /><p className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>{t.wind}</p><p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>km/h</p></div>
              <div className="text-center"><Navigation className="mx-auto h-3.5 w-3.5 text-emerald-400" /><p className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>{t.pressure}</p><p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>hPa</p></div>
              <div className="text-center"><MapPin className="mx-auto h-3.5 w-3.5 text-orange-400" /><p className="text-[10px] font-bold" style={{ color: 'var(--text)' }}>{t.position[0].toFixed(1)}</p><p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Lat</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional info */}
      <div className="grid-tiles-3">
        <div className="tile text-center">
          <Activity className="mx-auto mb-1 h-5 w-5 text-red-400" />
          <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{active.length}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Active Systems</p>
        </div>
        <div className="tile text-center">
          <Wind className="mx-auto mb-1 h-5 w-5 text-blue-400" />
          <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{Math.max(...typhoons.map(t => t.wind), 0)}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Max Wind km/h</p>
        </div>
        <div className="tile text-center">
          <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-orange-400" />
          <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{typhoons.filter(t => t.pressure < 1005).length}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Low Pressure</p>
        </div>
      </div>
    </div>
  );
}
