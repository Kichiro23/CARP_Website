import { useSoundscape } from '@/hooks/useSoundscape';
import { Volume2, VolumeX, CloudRain, Wind, TreePine, Waves, Flame, AlertCircle } from 'lucide-react';

const SOUNDS = [
  { key: 'rain', icon: CloudRain, label: 'Rain' },
  { key: 'wind', icon: Wind, label: 'Wind' },
  { key: 'forest', icon: TreePine, label: 'Forest' },
  { key: 'ocean', icon: Waves, label: 'Ocean' },
  { key: 'fire', icon: Flame, label: 'Fire' },
];

export default function SoundscapeBar() {
  const { enabled, toggle, play, stop, currentSound, error } = useSoundscape();

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggle}
        title={enabled ? 'Disable ambient sounds' : 'Enable ambient sounds'}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:opacity-80"
        style={{ background: enabled ? 'var(--accent)' : 'transparent' }}
      >
        {enabled ? <Volume2 className="h-4 w-4" style={{ color: 'var(--primary)' }} /> : <VolumeX className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />}
      </button>
      {enabled && (
        <div className="flex items-center gap-1">
          {SOUNDS.map(s => {
            const Icon = s.icon;
            const active = currentSound === s.key;
            return (
              <button
                key={s.key}
                onClick={() => active ? stop() : play(s.key)}
                title={s.label}
                className="flex h-7 w-7 items-center justify-center rounded-full transition-all"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  opacity: active ? 1 : 0.6,
                }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }} />
              </button>
            );
          })}
        </div>
      )}
      {enabled && error && (
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-orange-400" title={error}>
          <AlertCircle className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
