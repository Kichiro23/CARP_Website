import { useState } from 'react';
import { Moon, Sun, Globe, Bell, Save } from 'lucide-react';

interface Props { theme: 'light' | 'dark'; toggleTheme: () => void; }

export default function Settings({ theme, toggleTheme }: Props) {
  const isDark = theme === 'dark';
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Customize your experience</p>
      </div>

      <div className="tile">
        <h3 className="tile-title">Appearance</h3>
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--tile-border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            {isDark ? <Moon className="h-5 w-5 shrink-0" style={{ color: 'var(--accent)' }} /> : <Sun className="h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} />}
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Theme</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{isDark ? 'Dark mode active' : 'Light mode active'}</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="relative h-7 w-12 rounded-full transition-all shrink-0" style={{ background: isDark ? 'var(--primary)' : '#E5E7EB' }}>
            <div className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all" style={{ left: isDark ? '26px' : '2px' }} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Globe className="h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} />
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Temperature Unit</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Preferred unit</p>
            </div>
          </div>
          <div className="flex rounded-lg overflow-hidden border shrink-0" style={{ borderColor: 'var(--tile-border)' }}>
            <button onClick={() => setUnit('C')} className="px-3 py-1.5 text-xs font-bold transition-all" style={{ background: unit === 'C' ? 'var(--primary)' : 'rgba(255,255,255,0.02)', color: unit === 'C' ? '#fff' : 'var(--text-muted)' }}>C</button>
            <button onClick={() => setUnit('F')} className="px-3 py-1.5 text-xs font-bold transition-all" style={{ background: unit === 'F' ? 'var(--primary)' : 'rgba(255,255,255,0.02)', color: unit === 'F' ? '#fff' : 'var(--text-muted)' }}>F</button>
          </div>
        </div>
      </div>

      <div className="tile">
        <h3 className="tile-title">Notifications</h3>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Bell className="h-5 w-5 shrink-0" style={{ color: 'var(--primary)' }} />
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Weather Alerts</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Severe weather notifications</p>
            </div>
          </div>
          <button onClick={() => setNotifications(!notifications)} className="relative h-7 w-12 rounded-full transition-all shrink-0" style={{ background: notifications ? 'var(--primary)' : '#E5E7EB' }}>
            <div className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all" style={{ left: notifications ? '26px' : '2px' }} />
          </button>
        </div>
      </div>

      {saved && <div className="rounded-lg bg-emerald-500/10 px-4 py-2.5 text-center text-xs text-emerald-400">Settings saved</div>}
      <button onClick={handleSave} className="glass-btn w-full flex items-center justify-center gap-2 py-3 text-sm"><Save className="h-4 w-4" /> Save Settings</button>
    </div>
  );
}
