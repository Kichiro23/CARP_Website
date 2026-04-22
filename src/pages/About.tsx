import { BarChart3, Shield, Globe, Newspaper, Zap } from 'lucide-react';
import { TEAM } from '@/config/api';

const features = [
  { icon: BarChart3, title: 'Live Weather Data', desc: 'Real-time weather metrics from Open-Meteo API including temperature, humidity, wind, UV index, and precipitation.' },
  { icon: Shield, title: 'Air Quality Monitoring', desc: 'Track PM2.5, PM10, CO, NO2, O3, SO2 levels with AQI classification and health recommendations.' },
  { icon: Globe, title: 'Global Coverage', desc: 'Weather data for any city worldwide with country-level insights and interactive maps.' },
  { icon: Newspaper, title: 'Climate News', desc: 'Latest environmental news from The Guardian and BBC Science & Environment feeds.' },
  { icon: Zap, title: 'AI Insights', desc: 'Smart clothing, travel, and health recommendations based on current weather conditions.' },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>About CARP</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Climate & Air Research Platform</p>
      </div>
      <div className="tile mb-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text)' }}>CARP</strong> is a comprehensive climate and air quality monitoring platform developed by BSCpE 3C students for the academic year 2025-2026. It provides real-time weather analytics, air quality indices, and environmental insights powered by global meteorological data sources.
        </p>
      </div>
      <div className="mb-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Features</h2>
        <div className="grid-tiles-2">
          {features.map(f => (
            <div key={f.title} className="tile">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(234,157,99,0.10)' }}>
                <f.icon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="mb-1 text-sm font-bold" style={{ color: 'var(--text)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Development Team</h2>
        <div className="grid-tiles-2">
          {TEAM.map(m => (
            <div key={m.name} className="tile flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}>
                {m.initials}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
