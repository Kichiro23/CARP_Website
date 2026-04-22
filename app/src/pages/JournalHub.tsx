import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import WeatherJournal from './WeatherJournal';
import ZenMode from './ZenMode';

const TABS = [
  { key: 'journal', label: 'Journal', icon: BookOpen },
  { key: 'zen', label: 'Zen Mode', icon: Sparkles },
];

export default function JournalHub() {
  const [active, setActive] = useState('journal');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Journal</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Track your mood and find your calm</p>
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

      {active === 'journal' && <WeatherJournal />}
      {active === 'zen' && <ZenMode />}
    </div>
  );
}
