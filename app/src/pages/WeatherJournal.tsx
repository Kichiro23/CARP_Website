import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, Trash2, CloudSun, Save, X } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  weather: string;
  mood: string;
  note: string;
  location: string;
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

  useEffect(() => { saveEntries(entries); }, [entries]);

  const handleSave = () => {
    if (!note.trim()) return;
    const entry: JournalEntry = {
      id: `je-${Date.now()}`,
      date: new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      weather: weather || 'Not recorded',
      mood: mood || 'Neutral',
      note: note.trim(),
      location: location || 'Unknown',
    };
    setEntries(prev => [entry, ...prev]);
    setWeather(''); setMood(''); setNote(''); setLocation(''); setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const moods = ['😊 Happy', '😢 Sad', '😴 Tired', '😰 Anxious', '🤩 Excited', '😌 Calm'];
  const weathers = ['☀️ Sunny', '☁️ Cloudy', '🌧️ Rainy', '⛈️ Stormy', '🌫️ Foggy', '❄️ Cold'];

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard</Link>
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

      {showForm && (
        <div className="tile space-y-3">
          <h3 className="text-xs font-bold uppercase" style={{ color: 'var(--primary)' }}>New Entry</h3>
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
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>• {e.location}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{e.weather}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.mood}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{e.note}</p>
              </div>
              <button onClick={() => handleDelete(e.id)} className="rounded p-1 text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
