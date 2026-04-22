import { useState, useEffect } from 'react';
import { Pause, Volume2, Wind, CloudRain, TreePine, Waves, Flame, AlertCircle } from 'lucide-react';
import { useSoundscape } from '@/hooks/useSoundscape';

const SOUNDS = [
  { key: 'rain', label: 'Gentle Rain', icon: CloudRain, color: '#60a5fa' },
  { key: 'wind', label: 'Wind & Birds', icon: Wind, color: '#34d399' },
  { key: 'forest', label: 'Forest Stream', icon: TreePine, color: '#22c55e' },
  { key: 'ocean', label: 'Ocean Waves', icon: Waves, color: '#0ea5e9' },
  { key: 'fire', label: 'Crackling Fire', icon: Flame, color: '#f97316' },
];

export default function ZenMode() {
  const { play, stop, currentSound, volume, setVolume, error } = useSoundscape();
  const [breathing, setBreathing] = useState(false);

  useEffect(() => {
    if (!breathing) return;
    const el = document.getElementById('breath-circle');
    if (!el) return;
    el.style.transition = 'transform 4s ease-in-out';
    const interval = setInterval(() => {
      el.style.transform = el.style.transform === 'scale(1.5)' ? 'scale(1)' : 'scale(1.5)';
    }, 4000);
    return () => clearInterval(interval);
  }, [breathing]);

  const toggleSound = (key: string) => {
    if (currentSound === key) stop();
    else play(key);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Zen Mode</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ambient sounds & guided breathing</p>
      </div>

      {/* Breathing */}
      <div className="tile flex flex-col items-center gap-4 py-8">
        <div
          id="breath-circle"
          className="h-32 w-32 rounded-full flex items-center justify-center transition-transform"
          style={{ background: 'var(--accent)', transform: 'scale(1)' }}
        >
          <span className="text-3xl">🧘</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{breathing ? 'Breathe with the circle...' : 'Press start to begin guided breathing'}</p>
        <button onClick={() => setBreathing(b => !b)} className="glass-badge cursor-pointer text-sm px-4 py-2">
          {breathing ? 'Stop' : 'Start'} Breathing
        </button>
      </div>

      {/* Sound picker */}
      <div className="grid-tiles-3">
        {SOUNDS.map(s => {
          const isActive = currentSound === s.key;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => toggleSound(s.key)}
              className="tile text-center cursor-pointer transition-transform hover:scale-[1.02]"
              style={isActive ? { borderColor: s.color, boxShadow: `0 0 0 1px ${s.color}` } : undefined}
            >
              <Icon className="mx-auto mb-2 h-6 w-6" style={{ color: s.color }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{s.label}</p>
              {isActive && <p className="text-[10px] mt-1" style={{ color: s.color }}>Playing</p>}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      {currentSound && (
        <div className="tile flex items-center justify-center gap-4">
          <button onClick={() => stop()} className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Pause className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Volume2 className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-[var(--primary)]"
            />
            <span className="text-xs w-8 text-right" style={{ color: 'var(--text-muted)' }}>{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}

      {error && (
        <div className="tile flex items-center gap-2 text-xs text-orange-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
