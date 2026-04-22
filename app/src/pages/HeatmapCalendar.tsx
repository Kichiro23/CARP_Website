import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, Wind, Droplets, CalendarDays } from 'lucide-react';
import { wmoEmoji } from '@/services/weatherApi';

interface DayData {
  date: string;
  temp: number;
  weatherCode: number;
}

// Generate realistic mock data for a full year
function generateYearData(year: number): DayData[] {
  const data: DayData[] = [];
  const start = new Date(year, 0, 1);
  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const month = d.getMonth();
    // Simulate Philippine weather patterns
    const baseTemp = month < 2 || month > 10 ? 28 : month < 5 ? 33 : 30; // Cooler Dec-Feb, hottest Mar-May
    const temp = baseTemp + Math.random() * 6 - 3;
    const codes = month < 2 || month > 10 ? [0, 1, 2, 3, 51] : [0, 1, 2, 3, 61, 63, 80];
    data.push({
      date: d.toISOString().split('T')[0],
      temp: Math.round(temp * 10) / 10,
      weatherCode: codes[Math.floor(Math.random() * codes.length)],
    });
  }
  return data;
}

function tempColor(temp: number): string {
  if (temp <= 20) return '#3b82f6'; // blue
  if (temp <= 25) return '#22c55e'; // green
  if (temp <= 30) return '#eab308'; // yellow
  if (temp <= 33) return '#f97316'; // orange
  return '#ef4444'; // red
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HeatmapCalendar() {
  const [year, setYear] = useState(2025);
  const [data, setData] = useState<DayData[]>([]);
  const [hovered, setHovered] = useState<DayData | null>(null);

  useEffect(() => { setData(generateYearData(year)); }, [year]);

  const getDayOffset = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.floor((d.getTime() - start.getTime()) / 86400000);
  };

  const weekOfYear = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const start = new Date(d.getFullYear(), 0, 1);
    const dayOne = start.getDay();
    return Math.floor((getDayOffset(dateStr) + dayOne) / 7);
  };

  const dayOfWeek = (dateStr: string) => new Date(dateStr + 'T00:00:00').getDay();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard</Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Heatmap Calendar</h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Manila temperature throughout the year</p>
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

      {/* Calendar Grid */}
      <div className="tile overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Month labels */}
          <div className="flex gap-1 mb-1 pl-8">
            {MONTHS.map(m => <div key={m} className="flex-1 text-center text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{m}</div>)}
          </div>
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-1">
              {WEEKDAYS.map(d => <div key={d} className="h-3 text-[9px] leading-3" style={{ color: 'var(--text-muted)' }}>{d}</div>)}
            </div>
            {/* Grid */}
            <div className="relative flex-1" style={{ height: 119 }}>
              {data.map(d => (
                <div
                  key={d.date}
                  className="absolute h-3 w-3 rounded-sm cursor-pointer transition-transform hover:scale-125"
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

      {/* Hover Detail */}
      {hovered && (
        <div className="tile flex items-center gap-4">
          <CalendarDays className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{hovered.date}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{hovered.temp}°C {wmoEmoji(hovered.weatherCode)}</p>
          </div>
        </div>
      )}

      {/* Stats */}
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
    </div>
  );
}
