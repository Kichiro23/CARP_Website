import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PartyPopper, MapPin } from 'lucide-react';
import { fetchWeather, wmoEmoji } from '@/services/weatherApi';

interface PhHoliday {
  name: string;
  date: string;
  type: 'regular' | 'special';
  description: string;
}

const HOLIDAYS: PhHoliday[] = [
  { name: "New Year's Day", date: '2026-01-01', type: 'regular', description: 'Start the year fresh!' },
  { name: 'Chinese New Year', date: '2026-02-17', type: 'special', description: 'Year of the Horse celebrations' },
  { name: 'EDSA People Power', date: '2026-02-25', type: 'special', description: 'Commemorating democracy' },
  { name: 'Maundy Thursday', date: '2026-04-02', type: 'regular', description: 'Holy Week begins' },
  { name: 'Good Friday', date: '2026-04-03', type: 'regular', description: ' solemn reflection' },
  { name: 'Black Saturday', date: '2026-04-04', type: 'special', description: 'Day of mourning' },
  { name: 'Araw ng Kagitingan', date: '2026-04-09', type: 'regular', description: 'Day of Valor' },
  { name: 'Labor Day', date: '2026-05-01', type: 'regular', description: 'Workers unite!' },
  { name: 'Independence Day', date: '2026-06-12', type: 'regular', description: 'Philippine Independence' },
  { name: 'Ninoy Aquino Day', date: '2026-08-21', type: 'special', description: 'Remembering a hero' },
  { name: 'National Heroes Day', date: '2026-08-31', type: 'regular', description: 'Honoring all heroes' },
  { name: 'All Saints Day', date: '2026-11-01', type: 'special', description: 'Visit loved ones' },
  { name: 'Bonifacio Day', date: '2026-11-30', type: 'regular', description: 'Remembering Andres Bonifacio' },
  { name: 'Christmas Day', date: '2026-12-25', type: 'regular', description: 'Merry Christmas!' },
  { name: 'Rizal Day', date: '2026-12-30', type: 'regular', description: 'Dr. Jose Rizal commemoration' },
  { name: "New Year's Eve", date: '2026-12-31', type: 'special', description: 'Welcome 2027!' },
];

export default function HolidayForecast() {
  const [forecasts, setForecasts] = useState<Array<{ holiday: PhHoliday; temp: number; weatherCode: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results = [];
      for (const h of HOLIDAYS.slice(0, 6)) {
        const w = await fetchWeather(14.5995, 120.9842);
        if (w && w.daily[0]) {
          results.push({ holiday: h, temp: w.daily[0].maxTemp, weatherCode: w.daily[0].weatherCode });
        }
      }
      setForecasts(results);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard</Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Holiday Forecast 🎉</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Plan your Philippine holidays with weather in mind</p>
      </div>

      <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <MapPin className="h-3 w-3" style={{ color: 'var(--primary)' }} />
        <span>Forecasting for Manila, Philippines</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="tile"><div className="skeleton h-4 w-full" /></div>)}</div>
      ) : (
        <div className="space-y-2">
          {HOLIDAYS.map((h, i) => {
            const f = forecasts[i];
            const isPast = new Date(h.date) < new Date();
            return (
              <div key={h.name} className="tile flex items-center gap-3 !p-3" style={{ opacity: isPast ? 0.6 : 1 }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: h.type === 'regular' ? 'rgba(234,157,99,0.10)' : 'rgba(59,130,246,0.10)' }}>
                  <PartyPopper className="h-5 w-5" style={{ color: h.type === 'regular' ? 'var(--primary)' : '#3b82f6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{h.name}</p>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${h.type === 'regular' ? 'text-orange-400' : 'text-blue-400'}`} style={{ background: h.type === 'regular' ? 'rgba(234,157,99,0.10)' : 'rgba(59,130,246,0.10)' }}>{h.type === 'regular' ? 'Regular' : 'Special'}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(h.date).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{h.description}</p>
                </div>
                {f && (
                  <div className="shrink-0 text-right">
                    <span className="text-lg">{wmoEmoji(f.weatherCode)}</span>
                    <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{f.temp}°C</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
