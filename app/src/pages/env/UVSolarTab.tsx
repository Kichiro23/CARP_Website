import { useState, useEffect, useCallback } from 'react';
import { Sun, AlertTriangle } from 'lucide-react';
import { fetchUVData } from '@/services/weatherApi';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props { current: SavedLocation; }

export default function UVSolarTab({ current }: Props) {
  const [uv, setUV] = useState<{ uvMax: number; radiation: number; dates: string[]; uvValues: number[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const u = await fetchUVData(current.lat, current.lng);
      setUV(u);
      if (!u) setError('UV data unavailable for this location.');
    } catch { setError('Failed to load UV data.'); }
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

  const uvLevel = (index: number) => {
    if (index <= 2) return { label: 'Low', color: '#5CB85C' };
    if (index <= 5) return { label: 'Moderate', color: '#F0AD4E' };
    if (index <= 7) return { label: 'High', color: '#E87040' };
    if (index <= 10) return { label: 'Very High', color: '#D9534F' };
    return { label: 'Extreme', color: '#9B59B6' };
  };
  const todayUV = uvLevel(uv?.uvMax ?? 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="tile text-center">
          <Sun className="mx-auto mb-2 h-6 w-6" style={{ color: todayUV.color }} />
          <p className="text-2xl font-bold" style={{ color: todayUV.color }}>{uv?.uvMax ?? '--'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>UV Index Max · {todayUV.label}</p>
        </div>
        <div className="tile text-center">
          <Sun className="mx-auto mb-2 h-6 w-6 text-yellow-400" />
          <p className="text-2xl font-bold text-yellow-400">{uv?.radiation ?? '--'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Solar Radiation (MJ/m²)</p>
        </div>
        <div className="tile text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-orange-400" />
          <p className="text-lg font-bold text-orange-400">
            {(uv?.uvMax ?? 0) > 10 ? 'SPF 50+' : (uv?.uvMax ?? 0) > 7 ? 'SPF 30+' : (uv?.uvMax ?? 0) > 5 ? 'SPF 15+' : 'Minimal'}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Recommended Protection</p>
        </div>
      </div>
      <div className="tile">
        <h3 className="tile-title">7-Day UV Forecast</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {uv?.dates.map((d, i) => {
            const level = uvLevel(uv.uvValues[i] ?? 0);
            return (
              <div key={i} className="flex-1 min-w-[50px] text-center rounded-lg border p-2" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{d}</p>
                <p className="text-lg font-bold my-1" style={{ color: level.color }}>{uv.uvValues[i]}</p>
                <p className="text-[8px]" style={{ color: level.color }}>{level.label}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="tile">
        <h3 className="tile-title">UV Safety Guide</h3>
        <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <p><strong style={{ color: '#5CB85C' }}>Low (0-2):</strong> Minimal protection required. Safe to be outside.</p>
          <p><strong style={{ color: '#F0AD4E' }}>Moderate (3-5):</strong> Wear sunglasses and apply SPF 15+ on exposed skin.</p>
          <p><strong style={{ color: '#E87040' }}>High (6-7):</strong> Reduce sun exposure 10am-4pm. SPF 30+ required.</p>
          <p><strong style={{ color: '#D9534F' }}>Very High (8-10):</strong> Minimize sun exposure. SPF 30+, hat, and sunglasses essential.</p>
          <p><strong style={{ color: '#9B59B6' }}>Extreme (11+):</strong> Avoid sun exposure. Full protective clothing and SPF 50+.</p>
        </div>
      </div>
    </div>
  );
}
