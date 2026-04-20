import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Globe, Trash2 } from 'lucide-react';
import type { Theme } from '@/types';

export default function Settings({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [cleared, setCleared] = useState(false);

  const clearCache = () => {
    try {
      ['carp_news_cache', 'carp_countries_cache', 'carp_weather_cache'].forEach(k => localStorage.removeItem(k));
      setCleared(true); setTimeout(() => setCleared(false), 2000);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4">
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Customize your CARP experience</p>
      </div>
      <div className="space-y-3">
        <div className="tile">
          <h3 className="tile-title">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-4 w-4" style={{ color: 'var(--primary)' }} /> : <Sun className="h-4 w-4 text-yellow-400" />}
              <div><p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Theme</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p></div>
            </div>
            <button onClick={toggleTheme} className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-white/5" style={{ borderColor: 'var(--tile-border)', color: 'var(--text-secondary)' }}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
        <div className="tile">
          <h3 className="tile-title">Units</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-blue-400" />
              <div><p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Measurement Unit</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{unit === 'metric' ? 'Celsius, km/h' : 'Fahrenheit, mph'}</p></div>
            </div>
            <button onClick={() => setUnit(u => u === 'metric' ? 'imperial' : 'metric')} className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-white/5" style={{ borderColor: 'var(--tile-border)', color: 'var(--text-secondary)' }}>
              Switch
            </button>
          </div>
        </div>
        <div className="tile">
          <h3 className="tile-title">Data</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="h-4 w-4 text-red-400" />
              <div><p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Clear Cache</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Remove cached weather and news data</p></div>
            </div>
            <button onClick={clearCache} className="rounded-lg border px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
              {cleared ? 'Cleared!' : 'Clear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
