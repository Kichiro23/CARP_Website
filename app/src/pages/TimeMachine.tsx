import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, History, Sparkles } from 'lucide-react';
import { fetchHistoricalWeather, wmoEmoji, wmoLabel } from '@/services/weatherApi';
import type { HistoricalWeather } from '@/types';

export default function TimeMachine() {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HistoricalWeather | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!date) return;
    setLoading(true); setError(''); setResult(null); setSearched(true);
    try {
      // Default to Manila
      const data = await fetchHistoricalWeather(14.5995, 120.9842, date);
      if (data) setResult(data);
      else setError('No historical data available for this date.');
    } catch {
      setError('Failed to fetch historical weather.');
    }
    setLoading(false);
  };

  const funFacts: Record<number, string> = {
    0: 'Clear skies — perfect day for a picnic!',
    1: 'Mainly clear — great visibility for sightseeing.',
    2: 'Partly cloudy — a bit of everything.',
    3: 'Overcast — cozy indoor weather.',
    45: 'Foggy — mysterious atmosphere!',
    48: 'Rime fog — very rare and beautiful.',
    51: 'Light drizzle — bring a light jacket.',
    53: 'Drizzle — typical tropical afternoon.',
    55: 'Steady drizzle — perfect for reading.',
    61: "Rain — don't forget your umbrella!",
    63: 'Moderate rain — good for the plants.',
    65: 'Heavy rain — stay indoors if possible.',
    71: 'Light snow — rare in the Philippines!',
    73: 'Snow — bundle up!',
    75: 'Heavy snow — time for a snowball fight.',
    80: 'Light showers — on and off rain.',
    81: 'Showers — unpredictable day!',
    82: 'Heavy showers — watch for flooding.',
    95: "Thunderstorm — nature's light show!",
    96: 'Thunderstorm with hail — stay safe!',
    99: 'Severe thunderstorm — extreme weather!',
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard</Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Weather Time Machine 🕰️</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Travel back in time and see what the weather was like on any date</p>
      </div>

      <div className="tile">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Pick a Date</h3>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="glass-input flex-1"
          />
          <button onClick={handleSearch} disabled={loading || !date} className="glass-btn px-5">
            {loading ? <Clock className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>Data available from 1940 to present. Powered by Open-Meteo Archive.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-center text-xs text-red-400">{error}</div>
      )}

      {result && (
        <div className="tile text-center">
          <div className="mb-3">
            <span className="text-6xl">{wmoEmoji(result.weatherCode)}</span>
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{result.maxTemp}°C / {result.minTemp}°C</h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{wmoLabel(result.weatherCode)}</p>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>in Manila, Philippines</p>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-3" style={{ background: 'rgba(234,157,99,0.05)', borderColor: 'rgba(234,157,99,0.15)' }}>
            <Sparkles className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{funFacts[result.weatherCode] || 'An interesting weather day!'}</p>
          </div>
        </div>
      )}

      {!result && !loading && searched && (
        <div className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>No data found for this date.</div>
      )}

      {!searched && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Your Birthday?', date: '2000-01-01' },
            { label: 'Last Christmas', date: '2024-12-25' },
            { label: 'New Year', date: '2024-01-01' },
            { label: 'Independence Day', date: '2024-06-12' },
          ].map(s => (
            <button key={s.label} onClick={() => { setDate(s.date); }} className="tile text-left !p-3 hover:border-[#EA9D6340]">
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{s.label}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.date}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
