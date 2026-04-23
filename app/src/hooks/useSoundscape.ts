import { useState, useEffect, useCallback } from 'react';

const ENABLED_KEY = 'carp-soundscape-enabled';
const VOLUME_KEY = 'carp-soundscape-volume';

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return globalAudioCtx;
}

// Generate noise buffer
function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown' = 'white'): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'white') {
      data[i] = white;
    } else if (type === 'pink') {
      data[i] = (white + (data[i - 1] || 0)) / 2;
    } else {
      data[i] = (white + (data[i - 1] || 0) * 0.96) / 2;
    }
  }
  return buffer;
}

interface SoundNode {
  ctx: AudioContext;
  gain: GainNode;
  sources: AudioBufferSourceNode[];
}

function createCrackleBurst(ctx: AudioContext, gain: GainNode, delay: number): AudioBufferSourceNode {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    // Sharp burst: loud at start, decay quickly
    const t = i / buffer.length;
    data[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t) * 0.6;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start(ctx.currentTime + delay);
  source.onended = () => {
    try { source.disconnect(); } catch { }
  };
  return source;
}

function scheduleCrackles(ctx: AudioContext, gain: GainNode): number {
  const interval = setInterval(() => {
    const delay = Math.random() * 0.5 + 0.05;
    createCrackleBurst(ctx, gain, delay);
  }, 150 + Math.random() * 400);
  return interval;
}

const soundEngines: Record<string, () => SoundNode> = {
  rain: () => {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    const buffer = createNoiseBuffer(ctx, 'white');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return { ctx, gain, sources: [source] };
  },
  wind: () => {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    const buffer = createNoiseBuffer(ctx, 'pink');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return { ctx, gain, sources: [source, lfo as any] };
  },
  ocean: () => {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    const buffer = createNoiseBuffer(ctx, 'brown');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return { ctx, gain, sources: [source, lfo as any] };
  },
  fire: () => {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    // Base rumble: brown noise
    const buffer = createNoiseBuffer(ctx, 'brown');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    // Crackle scheduler
    const interval = scheduleCrackles(ctx, gain);
    return { ctx, gain, sources: [source, { stop: () => clearInterval(interval) } as any] };
  },
  forest: () => {
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    const buffer = createNoiseBuffer(ctx, 'pink');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.3;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    // Bird chirps: random intervals
    const birdGain = ctx.createGain();
    birdGain.gain.value = 0.05;
    const birdOsc = ctx.createOscillator();
    birdOsc.type = 'triangle';
    birdOsc.frequency.value = 3000;
    const birdLfo = ctx.createOscillator();
    birdLfo.type = 'sine';
    birdLfo.frequency.value = 3;
    const birdLfoGain = ctx.createGain();
    birdLfoGain.gain.value = 1500;
    birdLfo.connect(birdLfoGain);
    birdLfoGain.connect(birdOsc.frequency);
    birdLfo.start();
    birdOsc.connect(birdGain);
    birdGain.connect(gain);
    birdOsc.start();
    return { ctx, gain, sources: [source, birdOsc as any, birdLfo as any] };
  },
};

const activeNodes: Record<string, SoundNode> = {};

function startSound(key: string): void {
  if (activeNodes[key]) return;
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  activeNodes[key] = soundEngines[key]();
}

function stopSound(key: string): void {
  const node = activeNodes[key];
  if (!node) return;
  node.sources.forEach(s => {
    try { s.stop(); } catch { /* already stopped */ }
  });
  delete activeNodes[key];
}

function stopAllSounds(): void {
  Object.keys(activeNodes).forEach(stopSound);
}

function setVolumeForAll(vol: number): void {
  Object.values(activeNodes).forEach(node => {
    node.gain.gain.setTargetAtTime(vol, node.ctx.currentTime, 0.1);
  });
}

export function useSoundscape() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(ENABLED_KEY) === 'true');
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(() => {
    const v = localStorage.getItem(VOLUME_KEY);
    return v ? parseFloat(v) : 0.3;
  });
  const [error, setError] = useState<string | null>(null);

  const play = useCallback((soundKey: string) => {
    if (!enabled) return;
    setError(null);
    try {
      stopAllSounds();
      startSound(soundKey);
      setVolumeForAll(volume);
      setCurrentSound(soundKey);
    } catch (err: any) {
      setError('Audio not available. Try clicking again.');
      setCurrentSound(null);
    }
  }, [enabled, volume]);

  const stop = useCallback(() => {
    stopAllSounds();
    setCurrentSound(null);
    setError(null);
  }, []);

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      localStorage.setItem(ENABLED_KEY, String(next));
      if (!next) {
        stopAllSounds();
        setCurrentSound(null);
        setError(null);
      }
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    localStorage.setItem(VOLUME_KEY, String(v));
    setVolumeForAll(v);
  }, []);

  useEffect(() => {
    return () => { stopAllSounds(); };
  }, []);

  return { enabled, toggle, play, stop, currentSound, volume, setVolume, error };
}
