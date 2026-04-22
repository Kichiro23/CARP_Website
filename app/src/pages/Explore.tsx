import { useState } from 'react';
import { Globe, GitCompare, Swords } from 'lucide-react';
import Countries from './Countries';
import Compare from './Compare';
import CityBattle from './CityBattle';

const TABS = [
  { key: 'countries', label: 'Countries', icon: Globe },
  { key: 'compare', label: 'Compare', icon: GitCompare },
  { key: 'battle', label: 'City Battle', icon: Swords },
];

export default function Explore() {
  const [active, setActive] = useState('countries');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Explore</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Discover and compare weather around the world</p>
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

      {active === 'countries' && <Countries />}
      {active === 'compare' && <Compare />}
      {active === 'battle' && <CityBattle />}
    </div>
  );
}
