import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Trash2, CloudSun, Save, X, MapPin, Thermometer, Wind, Droplets, BarChart3 } from 'lucide-react';
import { fetchWeather, wmoEmoji, wmoDescription } from '@/services/weatherApi';

interface JournalEntry {
  id: string;
  date: string;
  weather: string;
  mood: string;
  note: string;
  location: string;
  temp: number;
  wind: number;
  humidity: number;
}

const STORAGE_KEY = 'carp_weather_journal';

function loadEntries(): JournalEntry[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function WeatherJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);
  const [showForm, setShowForm] = useState(false);
  const [weather, setWeather] = useState('');
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [realTemp, setRealTemp] = useState(0);
  const [realWind, setRealWind] = useState(0);
  const [realHumidity, setRealHumidity] = useState(0);
  const [realCode, setRealCode] = useState(0);

  useEffect(() => { saveEntries(entries); }, [entries]);

  const loadRealWeather = useCallback(async () => {
    try {
      const w = await fetchWeather(14.5995, 120.9842);
      if (w) {
        setRealTemp(w.current.temperature);
        setRealWind(w.current.windSpeed);
        setRealHumidity(w.current.humidity);
        setRealCode(w.current.weatherCode);
        if (!weather) setWeather(wmoDescription(w.current.weatherCode));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { if (showForm) loadRealWeather(); }, [showForm, loadRealWeather]);

  const handleSave = () => {
    if (!note.trim()) return;
    const entry: JournalEntry = {
      id: `je-${Date.now()}`,
      date: new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      weather: weather || 'Not recorded',
      mood: mood || 'Neutral',
      note: note.trim(),
      location: location || 'Unknown',
      temp: realTemp,
      wind: realWind,
      humidity: realHumidity,
    };
    setEntries(prev => [entry, ...prev]);
    setWeather(''); setMood(''); setNote(''); setLocation(''); setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const moods = ['😊 Happy', '😢 Sad', '😴 Tired', '😰 Anxious', '🤩 Excited', '😌 Calm'];
  const weathers = ['☀️ Sunny', '☁️ Cloudy', '🌧️ Rainy', '⛈️ Stormy', '🌫️ Foggy', '❄️ Cold'];

  const moodCounts: Record<string, number> = {};
  entries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Weather Journal 📓</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Log how the weather makes you feel</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="glass-btn flex items-center gap-2 px-4 py-2 text-xs">
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} {showForm ? 'Cancel' : 'New Entry'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid-tiles-3">
          <div className="tile text-center">
            <BookOpen className="mx-auto mb-1 h-5 w-5" style={{ color: 'var(--primary)' }} />
            <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{entries.length}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total Entries</p>
          </div>
          <div className="tile text-center">
            <BarChart3 className="mx-auto mb-1 h-5 w-5 text-purple-400" />
            <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{topMood}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Top Mood</p>
          </div>
          <div className="tile text-center">
            <Thermometer className="mx-auto mb-1 h-5 w-5 text-red-400" />
            <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{(entries.reduce((a, e) => a + e.temp, 0) / entries.length).toFixed(1)}°</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Temp Logged</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="tile space-y-3">
          <h3 className="text-xs font-bold uppercase" style={{ color: 'var(--primary)' }}>New Entry</h3>
          {/* Live weather */}
          <div className="rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-2xl">{wmoEmoji(realCode)}</span>
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>Current Weather — {wmoDescription(realCode)}</p>
              <div className="flex gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" />{realTemp}°C</span>
                <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{realWind} km/h</span>
                <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{realHumidity}%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Where are you?" className="glass-input" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Weather</label>
            <div className="flex flex-wrap gap-2">
              {weathers.map(w => (
                <button key={w} onClick={() => setWeather(w)} className="rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: weather === w ? 'var(--primary)' : 'var(--tile-border)', background: weather === w ? 'rgba(234,157,99,0.10)' : 'var(--tile-bg)', color: 'var(--text)' }}>{w}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Mood</label>
            <div className="flex flex-wrap gap-2">
              {moods.map(m => (
                <button key={m} onClick={() => setMood(m)} className="rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: mood === m ? 'var(--primary)' : 'var(--tile-border)', background: mood === m ? 'rgba(234,157,99,0.10)' : 'var(--tile-bg)', color: 'var(--text)' }}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="How did the weather affect your day?" rows={3} className="glass-input resize-none" />
          </div>
          <button onClick={handleSave} className="glass-btn flex items-center gap-2 px-5 py-2 text-xs"><Save className="h-3.5 w-3.5" /> Save Entry</button>
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <div className="flex flex-col items-center py-12 text-center">
          <BookOpen className="mb-3 h-10 w-10" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No entries yet</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Start writing about how weather affects your mood!</p>
        </div>
      )}

      <div className="space-y-2">
        {entries.map(e => (
          <div key={e.id} className="tile !p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CloudSun className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--primary)' }}>{e.date}</span>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><MapPin className="h-3 w-3" />{e.location}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{e.weather}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.mood}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{e.note}</p>
                {e.temp > 0 && (
                  <div className="flex gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{e.temp}°C</span>
                    <span>{e.wind} km/h</span>
                    <span>{e.humidity}%</span>
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(e.id)} className="rounded p-1 text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
