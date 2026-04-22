import { useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import Analytics from './Analytics';
import Trends from './Trends';
import Alerts from './Alerts';
import type { SavedLocation } from '@/hooks/useLocation';

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'trends', label: 'Trends', icon: TrendingUp },
  { key: 'alerts', label: 'Alerts', icon: AlertTriangle },
];

interface Props { current: SavedLocation; }

export default function AnalyticsHub({ current }: Props) {
  const [active, setActive] = useState('overview');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Analytics</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Deep insights into weather patterns and alerts</p>
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

      {active === 'overview' && <Analytics current={current} />}
      {active === 'trends' && <Trends current={current} />}
      {active === 'alerts' && <Alerts current={current} />}
    </div>
  );
}
