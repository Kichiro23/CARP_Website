import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Eye } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

function PathLine({ path }: { path: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const poly = L.polyline(path, { color: '#D9534F', weight: 3, opacity: 0.8, dashArray: '5, 10' }).addTo(map);
    return () => { map.removeLayer(poly); };
  }, [map, path]);
  return null;
}
import 'leaflet/dist/leaflet.css';

interface Typhoon {
  id: string;
  name: string;
  category: string;
  windKph: number;
  pressure: number;
  lat: number;
  lng: number;
  path: [number, number][];
  timestamp: string;
  status: 'active' | 'dissipated';
}

// Simulated realistic typhoon data for demo
const ACTIVE_TYPHOONS: Typhoon[] = [
  {
    id: 'betty-2025',
    name: 'Typhoon Betty',
    category: 'Category 3',
    windKph: 140,
    pressure: 965,
    lat: 15.5,
    lng: 125.5,
    path: [[12.0, 130.0], [13.2, 128.5], [14.5, 127.0], [15.5, 125.5]],
    timestamp: '2025-04-21 06:00 UTC',
    status: 'active',
  },
];

const PAST_TYPHOONS: Typhoon[] = [
  {
    id: 'egay-2024',
    name: 'Typhoon Egay',
    category: 'Category 4',
    windKph: 185,
    pressure: 935,
    lat: 18.0,
    lng: 122.0,
    path: [[15.0, 135.0], [16.5, 132.0], [17.5, 128.0], [18.0, 122.0], [19.5, 118.0]],
    timestamp: '2024-07-26',
    status: 'dissipated',
  },
  {
    id: 'karding-2024',
    name: 'Typhoon Karding',
    category: 'Category 5',
    windKph: 220,
    pressure: 915,
    lat: 15.0,
    lng: 121.0,
    path: [[13.5, 132.0], [14.5, 128.0], [15.0, 124.0], [15.0, 121.0], [16.5, 118.0]],
    timestamp: '2024-09-25',
    status: 'dissipated',
  },
];

export default function TyphoonTracker() {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [selected, setSelected] = useState<Typhoon | null>(ACTIVE_TYPHOONS[0] || null);

  const typhoons = tab === 'active' ? ACTIVE_TYPHOONS : PAST_TYPHOONS;

  return (
    <div className="flex h-full flex-col -m-4 md:-m-6">
      <div className="shrink-0 p-4 md:p-6 pb-2">
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Typhoon Tracker 🌀</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Philippine Area of Responsibility</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setTab('active')} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${tab === 'active' ? 'text-white' : ''}`} style={{ background: tab === 'active' ? 'var(--primary)' : 'var(--tile-bg)', color: tab === 'active' ? 'white' : 'var(--text-secondary)' }}>Active</button>
            <button onClick={() => setTab('history')} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${tab === 'history' ? 'text-white' : ''}`} style={{ background: tab === 'history' ? 'var(--primary)' : 'var(--tile-bg)', color: tab === 'history' ? 'white' : 'var(--text-secondary)' }}>History</button>
          </div>
        </div>

        {tab === 'active' && ACTIVE_TYPHOONS.length === 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border px-4 py-3" style={{ background: 'rgba(92,184,92,0.08)', borderColor: 'rgba(92,184,92,0.2)' }}>
            <Eye className="h-4 w-4 text-green-400" />
            <p className="text-xs text-green-400">No active typhoons in PAR. The Philippines is currently safe.</p>
          </div>
        )}

        {typhoons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {typhoons.map(t => (
              <button key={t.id} onClick={() => setSelected(t)} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: selected?.id === t.id ? 'var(--primary)' : 'var(--tile-border)', background: selected?.id === t.id ? 'rgba(234,157,99,0.10)' : 'var(--tile-bg)', color: 'var(--text)' }}>
                <AlertTriangle className="h-3 w-3" style={{ color: t.status === 'active' ? '#D9534F' : 'var(--text-muted)' }} />
                {t.name}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border p-2 text-center" style={{ borderColor: 'var(--tile-border)', background: 'var(--tile-bg)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Category</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{selected.category}</p>
            </div>
            <div className="rounded-lg border p-2 text-center" style={{ borderColor: 'var(--tile-border)', background: 'var(--tile-bg)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Wind</p>
              <p className="text-xs font-bold text-red-400">{selected.windKph} km/h</p>
            </div>
            <div className="rounded-lg border p-2 text-center" style={{ borderColor: 'var(--tile-border)', background: 'var(--tile-bg)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Pressure</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{selected.pressure} hPa</p>
            </div>
            <div className="rounded-lg border p-2 text-center" style={{ borderColor: 'var(--tile-border)', background: 'var(--tile-bg)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Status</p>
              <p className={`text-xs font-bold ${selected.status === 'active' ? 'text-red-400' : 'text-emerald-400'}`}>{selected.status === 'active' ? 'ACTIVE' : 'Dissipated'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 mx-4 md:mx-6 mb-4 md:mb-6 min-h-[400px] rounded-xl overflow-hidden border" style={{ borderColor: 'var(--tile-border)' }}>
        <MapContainer center={[15, 122]} zoom={5} scrollWheelZoom style={{ height: '100%', width: '100%', background: 'var(--bg-secondary)' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {selected && (
            <>
              <PathLine path={selected.path} />
              {selected.path.map((pos, i) => (
                <Marker key={i} position={pos} icon={L.divIcon({
                  className: '',
                  iconSize: [i === selected.path.length - 1 ? 20 : 12, i === selected.path.length - 1 ? 20 : 12],
                  html: `<div style="width:${i === selected.path.length - 1 ? 20 : 12}px;height:${i === selected.path.length - 1 ? 20 : 12}px;border-radius:50%;background:${i === selected.path.length - 1 ? '#D9534F' : '#F0AD4E'};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`
                })}>
                  <Popup><div className="text-xs"><p className="font-bold">{selected.name}</p><p>Position {i + 1}</p></div></Popup>
                </Marker>
              ))}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
