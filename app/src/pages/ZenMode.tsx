import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { fetchWeather, wmoEmoji, wmoLabel } from '@/services/weatherApi';

const SOUNDS: Record<string, string> = {
  rain: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_5e92d4794a.mp3?filename=rain-and-thunder-112167.mp3',
  wind: 'https://cdn.pixabay.com/download/audio/2022/05/17/audio_1804f2e66a.mp3?filename=wind-and-birds-117093.mp3',
  forest: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_33c1577f37.mp3?filename=forest-with-small-river-birds-and-nature-111154.mp3',
};

export default function ZenMode() {
  const [weather, setWeather] = useState<{ temp: number; code: number; label: string } | null>(null);
  const [sound, setSound] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    (async () => {
      const w = await fetchWeather(14.5995, 120.9842);
      if (w) setWeather({ temp: w.current.temperature, code: w.current.weatherCode, label: wmoLabel(w.current.weatherCode) });
    })();
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!sound || muted) return;
    const audio = new Audio(SOUNDS[sound]);
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [sound, muted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  };

  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Background gradient based on time */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: time.getHours() >= 6 && time.getHours() < 18
            ? 'radial-gradient(ellipse at 50% 30%, rgba(234,157,99,0.08) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 50% 30%, rgba(100,100,200,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-muted)' }}><ArrowLeft className="h-3.5 w-3.5" /> Exit Zen</Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setMuted(!muted)} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--tile-bg)', border: '1px solid var(--tile-border)', color: 'var(--text-muted)' }}>
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={toggleFullscreen} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--tile-bg)', border: '1px solid var(--tile-border)', color: 'var(--text-muted)' }}>
            {fullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Zen Display */}
      <div className="relative z-10 text-center">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>{time.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <p className="text-7xl font-extralight tabular-nums tracking-tight" style={{ color: 'var(--text)' }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

        {weather && (
          <div className="mt-8 flex flex-col items-center gap-1">
            <span className="text-5xl">{wmoEmoji(weather.code)}</span>
            <p className="mt-2 text-2xl font-light" style={{ color: 'var(--text)' }}>{weather.temp}°C</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{weather.label}</p>
          </div>
        )}

        {/* Breathing circle */}
        <div className="mt-10 flex justify-center">
          <div className="h-24 w-24 rounded-full opacity-20" style={{ background: 'var(--primary)', animation: 'breathe 6s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Sound selector */}
      <div className="absolute bottom-8 z-10 flex gap-3">
        {[
          { key: 'rain', label: 'Rain', icon: '🌧️' },
          { key: 'wind', label: 'Wind', icon: '💨' },
          { key: 'forest', label: 'Forest', icon: '🌲' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => { setSound(s.key); setMuted(false); }}
            className="flex flex-col items-center gap-1 rounded-xl border px-4 py-2 text-xs transition-all hover:scale-105"
            style={{
              borderColor: sound === s.key ? 'var(--primary)' : 'var(--tile-border)',
              background: sound === s.key ? 'rgba(234,157,99,0.10)' : 'var(--tile-bg)',
              color: 'var(--text)',
            }}
          >
            <span className="text-lg">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.5); opacity: 0.05; }
        }
      `}</style>
    </div>
  );
}
