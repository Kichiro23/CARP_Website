import { useState } from 'react';
import { Waves, Sprout, Sun, Flame, MapPin } from 'lucide-react';
import WaterTab from './env/WaterTab';
import SoilTab from './env/SoilTab';
import UVSolarTab from './env/UVSolarTab';
import FireRiskTab from './env/FireRiskTab';
import type { SavedLocation } from '@/hooks/useLocation';

const TABS = [
  { key: 'water', label: 'Water & Marine', icon: Waves },
  { key: 'soil', label: 'Soil & Agriculture', icon: Sprout },
  { key: 'uv', label: 'UV & Solar', icon: Sun },
  { key: 'fire', label: 'Fire Risk', icon: Flame },
];

interface Props { current: SavedLocation; }

export default function Environment({ current }: Props) {
  const [active, setActive] = useState('water');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Environment</h1>
        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><MapPin className="h-3 w-3" />{current.name} — Monitoring terrestrial, aquatic, and atmospheric systems</p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border p-1" style={{ borderColor: 'var(--tile-border)', background: 'var(--tile-bg)' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all"
              style={{
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {active === 'water' && <WaterTab current={current} />}
      {active === 'soil' && <SoilTab current={current} />}
      {active === 'uv' && <UVSolarTab current={current} />}
      {active === 'fire' && <FireRiskTab current={current} />}
    </div>
  );
}
