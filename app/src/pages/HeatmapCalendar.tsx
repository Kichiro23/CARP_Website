import { useState, useEffect, useCallback } from 'react';
import { Thermometer, Wind, Droplets, CalendarDays } from 'lucide-react';
import { wmoEmoji } from '@/services/weatherApi';

interface DayData {
  date: string;
  temp: number;
  weatherCode: number;
}

function tempColor(temp: number): string {
  if (temp <= 20) return '#3b82f6';
  if (temp <= 25) return '#22c55e';
  if (temp <= 30) return '#eab308';
  if (temp <= 33) return '#f97316';
  return '#ef4444';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HeatmapCalendar() {
  const [year, setYear] = useState(2024);
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<DayData | null>(null);

  const loadYear = useCallback(async (targetYear: number) => {
    setLoading(true);
    try {
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=14.5995&longitude=120.9842&start_date=${targetYear}-01-01&end_date=${targetYear}-12-31&daily=temperature_2m_max,weather_code&timezone=auto`;
      const res = await fetch(url);
      const json = await res.json();
      const daily = json.daily;
      if (!daily?.time) { setData([]); setLoading(false); return; }
      const parsed: DayData[] = daily.time.map((t: string, i: number) => ({
        date: t,
        temp: Math.round((daily.temperature_2m_max?.[i] ?? 0) * 10) / 10,
        weatherCode: daily.weather_code?.[i] ?? 0,
      }));
      setData(parsed);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadYear(year); }, [year, loadYear]);

  const weekOfYear = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const start = new Date(d.getFullYear(), 0, 1);
    const dayOne = start.getDay();
    const offset = Math.floor((d.getTime() - start.getTime()) / 86400000);
    return Math.floor((offset + dayOne) / 7);
  };

  const dayOfWeek = (dateStr: string) => new Date(dateStr + 'T00:00:00').getDay();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Heatmap Calendar</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Real historical temperature data for Manila</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setYear(y => y - 1)} className="glass-badge cursor-pointer">←</button>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="glass-badge cursor-pointer">→</button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span>Cold</span>
        {['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'].map(c => (
          <div key={c} className="h-3 w-3 rounded-sm" style={{ background: c }} />
        ))}
        <span>Hot</span>
      </div>

      {loading ? (
        <div className="tile"><div className="skeleton h-40 w-full" /></div>
      ) : (
        <>
          <div className="tile overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="flex gap-1 mb-1 pl-8">
                {MONTHS.map(m => <div key={m} className="flex-1 text-center text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{m}</div>)}
              </div>
              <div className="flex gap-1">
                <div className="flex flex-col gap-1 pr-1">
                  {WEEKDAYS.map(d => <div key={d} className="h-3 text-[9px] leading-3" style={{ color: 'var(--text-muted)' }}>{d}</div>)}
                </div>
                <div className="relative flex-1" style={{ height: 119 }}>
                  {data.map(d => (
                    <div
                      key={d.date}
                      className="absolute h-3 w-3 rounded-sm cursor-pointer transition-transform hover:scale-150"
                      style={{
                        left: `${(weekOfYear(d.date) / 53) * 100}%`,
                        top: `${dayOfWeek(d.date) * 17}px`,
                        background: tempColor(d.temp),
                      }}
                      onMouseEnter={() => setHovered(d)}
                      onMouseLeave={() => setHovered(null)}
                      title={`${d.date}: ${d.temp}°C ${wmoEmoji(d.weatherCode)}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {hovered && (
            <div className="tile flex items-center gap-4">
              <CalendarDays className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{hovered.date}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{hovered.temp}°C {wmoEmoji(hovered.weatherCode)}</p>
              </div>
            </div>
          )}

          {data.length > 0 && (
            <div className="grid-tiles-4">
              <div className="tile text-center">
                <Thermometer className="mx-auto mb-1 h-5 w-5 text-red-400" />
                <p className="text-lg font-bold text-red-400">{Math.max(...data.map(d => d.temp))}°</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Hottest Day</p>
              </div>
              <div className="tile text-center">
                <Thermometer className="mx-auto mb-1 h-5 w-5 text-blue-400" />
                <p className="text-lg font-bold text-blue-400">{Math.min(...data.map(d => d.temp))}°</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Coolest Day</p>
              </div>
              <div className="tile text-center">
                <Wind className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
                <p className="text-lg font-bold text-emerald-400">{(data.reduce((a, b) => a + b.temp, 0) / data.length).toFixed(1)}°</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Yearly Average</p>
              </div>
              <div className="tile text-center">
                <Droplets className="mx-auto mb-1 h-5 w-5 text-blue-400" />
                <p className="text-lg font-bold text-blue-400">{data.filter(d => d.weatherCode >= 61).length}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Rainy Days</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
