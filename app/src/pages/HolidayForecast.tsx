import { useState, useEffect } from 'react';
import { Calendar, MapPin, Thermometer, Wind, Sun, CloudRain } from 'lucide-react';
import { wmoEmoji, wmoDescription } from '@/services/weatherApi';

interface Holiday {
  name: string;
  date: string;
  type: 'Regular' | 'Special' | 'Observance';
}

interface HolidayWeather {
  holiday: Holiday;
  temp: number;
  weatherCode: number;
  wind: number;
}

function getPHHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [
    { name: "New Year's Day", date: `${year}-01-01`, type: 'Regular' },
    { name: 'Araw ng Kagitingan', date: `${year}-04-09`, type: 'Regular' },
    { name: 'Maundy Thursday', date: `${year}-04-17`, type: 'Regular' },
    { name: 'Good Friday', date: `${year}-04-18`, type: 'Regular' },
    { name: 'Labor Day', date: `${year}-05-01`, type: 'Regular' },
    { name: 'Independence Day', date: `${year}-06-12`, type: 'Regular' },
    { name: 'National Heroes Day', date: `${year}-08-25`, type: 'Regular' },
    { name: 'Bonifacio Day', date: `${year}-11-30`, type: 'Regular' },
    { name: 'Christmas Day', date: `${year}-12-25`, type: 'Regular' },
    { name: 'Rizal Day', date: `${year}-12-30`, type: 'Regular' },
    { name: 'Chinese New Year', date: `${year}-01-29`, type: 'Special' },
    { name: "Valentine's Day", date: `${year}-02-14`, type: 'Observance' },
    { name: 'Holy Saturday', date: `${year}-04-19`, type: 'Special' },
    { name: 'Ninoy Aquino Day', date: `${year}-08-21`, type: 'Special' },
    { name: 'All Saints Day', date: `${year}-11-01`, type: 'Special' },
    { name: 'Christmas Eve', date: `${year}-12-24`, type: 'Special' },
    { name: "New Year's Eve", date: `${year}-12-31`, type: 'Special' },
    { name: 'Undas', date: `${year}-11-02`, type: 'Observance' },
    { name: 'Pasko ng Pagkabuhay', date: `${year}-04-20`, type: 'Observance' },
  ];
  return holidays.filter(h => new Date(h.date + 'T00:00:00') >= new Date());
}

async function fetchHolidayWeather(date: string): Promise<{ temp: number; weatherCode: number; wind: number } | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=14.5995&longitude=120.9842&start_date=${date}&end_date=${date}&daily=temperature_2m_max,weather_code&hourly=windspeed_10m&timezone=auto`;
    const res = await fetch(url);
    const json = await res.json();
    return {
      temp: json.daily?.temperature_2m_max?.[0] ?? 0,
      weatherCode: json.daily?.weather_code?.[0] ?? 0,
      wind: json.hourly?.windspeed_10m?.[12] ?? 0,
    };
  } catch { return null; }
}

export default function HolidayForecast() {
  const [holidays, setHolidays] = useState<HolidayWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [city] = useState('Manila');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const upcoming = getPHHolidays(2026);
      const results = await Promise.all(
        upcoming.slice(0, 10).map(async h => {
          const w = await fetchHolidayWeather(h.date);
          if (cancelled) return null;
          return { holiday: h, temp: w?.temp ?? 0, weatherCode: w?.weatherCode ?? 0, wind: w?.wind ?? 0 };
        })
      );
      if (!cancelled) setHolidays(results.filter(Boolean) as HolidayWeather[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Holiday Forecast</h1>
        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><MapPin className="h-3 w-3" /> {city}, Philippines — Real upcoming weather</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="tile"><div className="skeleton h-16 w-full" /></div>)}
        </div>
      ) : holidays.length === 0 ? (
        <div className="tile text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <Calendar className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">No upcoming holidays with forecast available.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {holidays.map(h => (
            <div key={h.holiday.date} className="tile flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--card)' }}>
                <span className="text-lg">{wmoEmoji(h.weatherCode)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{h.holiday.name}</p>
                <p className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Calendar className="h-3 w-3" />{h.holiday.date} · <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ background: h.holiday.type === 'Regular' ? 'var(--accent)' : h.holiday.type === 'Special' ? '#4f46e5' : '#059669', color: 'white' }}>{h.holiday.type}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{h.temp}°</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{wmoDescription(h.weatherCode)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats summary */}
      {!loading && holidays.length > 0 && (
        <div className="grid-tiles-4">
          <div className="tile text-center">
            <Sun className="mx-auto mb-1 h-5 w-5 text-yellow-400" />
            <p className="text-lg font-bold text-yellow-400">{holidays.filter(h => h.weatherCode <= 3).length}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sunny Holidays</p>
          </div>
          <div className="tile text-center">
            <CloudRain className="mx-auto mb-1 h-5 w-5 text-blue-400" />
            <p className="text-lg font-bold text-blue-400">{holidays.filter(h => h.weatherCode >= 61).length}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Rainy Holidays</p>
          </div>
          <div className="tile text-center">
            <Thermometer className="mx-auto mb-1 h-5 w-5 text-red-400" />
            <p className="text-lg font-bold text-red-400">{Math.round(holidays.reduce((a, h) => a + h.temp, 0) / holidays.length)}°</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Holiday Temp</p>
          </div>
          <div className="tile text-center">
            <Wind className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
            <p className="text-lg font-bold text-emerald-400">{Math.round(holidays.reduce((a, h) => a + h.wind, 0) / holidays.length)}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Wind km/h</p>
          </div>
        </div>
      )}
    </div>
  );
}
