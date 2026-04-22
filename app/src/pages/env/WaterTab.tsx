import { useState, useEffect, useCallback } from 'react';
import { Waves, Activity, Droplets } from 'lucide-react';
import { fetchMarineData, fetchRiverDischarge } from '@/services/weatherApi';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props { current: SavedLocation; }

export default function WaterTab({ current }: Props) {
  const [marine, setMarine] = useState<{ seaSurfaceTemp: number | null; waveHeight: number | null } | null>(null);
  const [river, setRiver] = useState<{ discharge: number | null; date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [m, r] = await Promise.all([
        fetchMarineData(current.lat, current.lng),
        fetchRiverDischarge(current.lat, current.lng),
      ]);
      setMarine(m);
      setRiver(r);
      if (!m && !r) setError('Water data unavailable for this location.');
    } catch { setError('Failed to load water data.'); }
    setLoading(false);
  }, [current.lat, current.lng]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="tile"><div className="skeleton h-40 w-full" /></div>;
  if (error) return (
    <div className="tile text-center py-8">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
      <button onClick={load} className="glass-btn mt-3 px-4 py-2 text-xs">Retry</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="tile text-center">
          <Waves className="mx-auto mb-2 h-6 w-6 text-blue-400" />
          <p className="text-2xl font-bold text-blue-400">{marine?.seaSurfaceTemp !== null ? `${marine?.seaSurfaceTemp}°C` : '--'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sea Surface Temp</p>
        </div>
        <div className="tile text-center">
          <Activity className="mx-auto mb-2 h-6 w-6 text-cyan-400" />
          <p className="text-2xl font-bold text-cyan-400">{marine?.waveHeight !== null ? `${marine?.waveHeight}m` : '--'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Wave Height Max</p>
        </div>
        <div className="tile text-center">
          <Droplets className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
          <p className="text-2xl font-bold text-emerald-400">{river?.discharge !== null ? `${Math.round(river?.discharge || 0)}` : '--'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>River Discharge (m³/s)</p>
        </div>
      </div>
      <div className="tile">
        <h3 className="tile-title">About Water Data</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Marine data includes sea surface temperature and maximum wave height from the Open-Meteo Marine API.
          River discharge measures the volume of water flowing through rivers, critical for flood monitoring and water resource management.
          Data sources: Open-Meteo Marine API, Open-Meteo Flood API.
        </p>
      </div>
    </div>
  );
}
