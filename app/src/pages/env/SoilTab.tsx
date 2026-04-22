import { useState, useEffect, useCallback } from 'react';
import { Droplets, Thermometer, Leaf } from 'lucide-react';
import { fetchSoilData } from '@/services/weatherApi';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props { current: SavedLocation; }

export default function SoilTab({ current }: Props) {
  const [soil, setSoil] = useState<{ moisture: number | null; temperature: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const s = await fetchSoilData(current.lat, current.lng);
      setSoil(s);
      if (!s) setError('Soil data unavailable for this location.');
    } catch { setError('Failed to load soil data.'); }
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

  const moisturePct = soil?.moisture !== null && soil?.moisture !== undefined ? Math.round((soil.moisture as number) * 100) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="tile text-center">
          <Droplets className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
          <p className="text-2xl font-bold text-emerald-400">{moisturePct !== null ? `${moisturePct}%` : '--'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Soil Moisture (0-1cm)</p>
        </div>
        <div className="tile text-center">
          <Thermometer className="mx-auto mb-2 h-6 w-6 text-orange-400" />
          <p className="text-2xl font-bold text-orange-400">{soil?.temperature !== null ? `${soil?.temperature}°C` : '--'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Soil Temp (0-7cm)</p>
        </div>
      </div>
      <div className="tile">
        <h3 className="tile-title">Agricultural Insights</h3>
        <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <p><Leaf className="inline h-3.5 w-3.5 mr-1 text-emerald-400" />
            {moisturePct !== null && moisturePct > 40 ? 'Soil moisture is adequate for most crops.' : moisturePct !== null && moisturePct > 20 ? 'Soil moisture is moderate. Consider irrigation for sensitive crops.' : 'Soil moisture is low. Irrigation recommended.'}
          </p>
          <p><Thermometer className="inline h-3.5 w-3.5 mr-1 text-orange-400" />
            {soil?.temperature !== null && (soil?.temperature as number) > 25 ? 'Soil temperature is warm — ideal for tropical crops.' : soil?.temperature !== null && (soil?.temperature as number) > 15 ? 'Soil temperature is moderate — suitable for most temperate crops.' : 'Soil temperature is cool — growth may be slower.'}
          </p>
        </div>
      </div>
      <div className="tile">
        <h3 className="tile-title">About Soil Data</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Soil moisture and temperature are measured at shallow depths (0-1cm and 0-7cm) using Open-Meteo's soil data models.
          These metrics are critical for agriculture, drought monitoring, and understanding ecosystem health.
          Data source: Open-Meteo Forecast API (ERA5-Land reanalysis).
        </p>
      </div>
    </div>
  );
}
