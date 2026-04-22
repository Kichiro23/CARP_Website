import { useState } from 'react';
import { History, LayoutGrid, PartyPopper, CloudLightning } from 'lucide-react';
import TimeMachine from './TimeMachine';
import HeatmapCalendar from './HeatmapCalendar';
import HolidayForecast from './HolidayForecast';
import TyphoonTracker from './TyphoonTracker';

const TABS = [
  { key: 'timemachine', label: 'Time Machine', icon: History },
  { key: 'heatmap', label: 'Heatmap', icon: LayoutGrid },
  { key: 'holidays', label: 'Holidays', icon: PartyPopper },
  { key: 'typhoons', label: 'Typhoons', icon: CloudLightning },
];

export default function WeatherTools() {
  const [active, setActive] = useState('timemachine');

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Vertical tab bar on desktop, horizontal scroll on mobile */}
      <div className="shrink-0 md:w-48">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Weather Tools</h1>
        <p className="text-xs mb-3 hidden md:block" style={{ color: 'var(--text-secondary)' }}>Specialized tools for data, forecasts, and tracking</p>
        <div className="flex md:flex-col gap-1 rounded-xl border p-1 overflow-x-auto" style={{ borderColor: 'var(--tile-border)', background: 'var(--tile-bg)' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all whitespace-nowrap md:whitespace-normal flex-1 md:flex-none justify-center md:justify-start"
                style={{
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                <Icon className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline md:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {active === 'timemachine' && <TimeMachine />}
        {active === 'heatmap' && <HeatmapCalendar />}
        {active === 'holidays' && <HolidayForecast />}
        {active === 'typhoons' && <TyphoonTracker />}
      </div>
    </div>
  );
}
