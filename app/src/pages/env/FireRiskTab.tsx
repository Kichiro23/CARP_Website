import { useState, useEffect, useCallback } from 'react';
import { Flame, Thermometer, Droplets, Wind, Sun } from 'lucide-react';
import { fetchFireRisk } from '@/services/weatherApi';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props { current: SavedLocation; }

export default function FireRiskTab({ current }: Props) {
  const [fire, setFire] = useState<{
    risk: 'Low' | 'Moderate' | 'High' | 'Extreme';
    riskColor: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    droughtIndex: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const f = await fetchFireRisk(current.lat, current.lng);
      setFire(f);
      if (!f) setError('Fire risk data unavailable for this location.');
    } catch { setError('Failed to load fire risk data.'); }
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
  if (!fire) return <div className="tile text-center py-8" style={{ color: 'var(--text-muted)' }}>Fire risk data unavailable for this location.</div>;

  return (
    <div className="space-y-4">
      <div className="tile text-center py-6" style={{ borderColor: fire.riskColor, borderWidth: 2 }}>
        <Flame className="mx-auto mb-2 h-8 w-8" style={{ color: fire.riskColor }} />
        <p className="text-3xl font-bold" style={{ color: fire.riskColor }}>{fire.risk}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Fire Risk Level</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="tile text-center">
          <Thermometer className="mx-auto mb-1 h-5 w-5 text-red-400" />
          <p className="text-lg font-bold text-red-400">{fire.temperature}°</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Temperature</p>
        </div>
        <div className="tile text-center">
          <Droplets className="mx-auto mb-1 h-5 w-5 text-blue-400" />
          <p className="text-lg font-bold text-blue-400">{fire.humidity}%</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Humidity</p>
        </div>
        <div className="tile text-center">
          <Wind className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
          <p className="text-lg font-bold text-emerald-400">{fire.windSpeed}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Wind km/h</p>
        </div>
        <div className="tile text-center">
          <Sun className="mx-auto mb-1 h-5 w-5 text-yellow-400" />
          <p className="text-lg font-bold text-yellow-400">{fire.droughtIndex.toFixed(1)}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Evapotranspiration</p>
        </div>
      </div>
      <div className="tile">
        <h3 className="tile-title">Fire Risk Factors</h3>
        <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <p><strong style={{ color: 'var(--text)' }}>Temperature:</strong> Higher temperatures dry out vegetation faster, increasing fire risk.</p>
          <p><strong style={{ color: 'var(--text)' }}>Humidity:</strong> Low humidity means drier air and fuel, making fires spread faster.</p>
          <p><strong style={{ color: 'var(--text)' }}>Wind Speed:</strong> Strong winds can push fires across landscapes rapidly.</p>
          <p><strong style={{ color: 'var(--text)' }}>Evapotranspiration:</strong> Higher rates indicate drier soil and vegetation conditions.</p>
        </div>
      </div>
      <div className="tile" style={{ background: fire.risk === 'Extreme' || fire.risk === 'High' ? 'rgba(217,83,79,0.06)' : undefined }}>
        <h3 className="tile-title">Prevention Tips</h3>
        <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {fire.risk === 'Extreme' || fire.risk === 'High' ? (
            <>
              <p className="text-red-400 font-bold">⚠️ High fire risk — follow these precautions:</p>
              <p>• Avoid any outdoor burning or open flames</p>
              <p>• Report any smoke or fire immediately to authorities</p>
              <p>• Keep vehicles off dry grass — hot exhausts can ignite fires</p>
              <p>• Clear dry leaves and debris from around your property</p>
            </>
          ) : (
            <>
              <p>• Dispose of cigarette butts properly — never on dry ground</p>
              <p>• Follow local fire restrictions and burn bans</p>
              <p>• Maintain defensible space around buildings (clear vegetation)</p>
              <p>• Report unattended campfires or suspicious smoke</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
