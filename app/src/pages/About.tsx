import { BarChart3, Shield, Globe, Newspaper, Droplets, Sprout, Sun, Flame, History, CalendarDays, CloudRain, BookOpen, Sparkles, Map, Brain, Leaf, Users } from 'lucide-react';
import { TEAM } from '@/config/api';

const features = [
  { icon: BarChart3, title: 'Real-Time Weather & Climate', desc: 'Live temperature, humidity, wind, UV index, precipitation, visibility, cloud cover, surface pressure, and hourly/daily forecasts.' },
  { icon: Shield, title: 'Air Quality Monitoring', desc: 'Track PM2.5, PM10, CO, NO₂, O₃, SO₂ with AQI classification, 24-hour forecasts, and health recommendations.' },
  { icon: Droplets, title: 'Water & Marine Systems', desc: 'Sea surface temperature, wave height, and river discharge monitoring for aquatic environmental health.' },
  { icon: Sprout, title: 'Soil & Agriculture', desc: 'Soil moisture and temperature with agricultural insights for crop management and drought assessment.' },
  { icon: Sun, title: 'UV & Solar Radiation', desc: '7-day UV index forecasts with solar radiation data and SPF protection recommendations.' },
  { icon: Flame, title: 'Wildfire Risk Assessment', desc: 'Fire risk calculator based on temperature, humidity, wind, and evapotranspiration with prevention guidelines.' },
  { icon: Map, title: 'Interactive Live Map', desc: 'Global map with AQI markers, precipitation radar, cloud cover overlays, and weather detail panels.' },
  { icon: Globe, title: 'Global City Explorer', desc: '60+ preloaded cities across 6 continents, country profiles, city battle rankings, and side-by-side weather comparison.' },
  { icon: History, title: 'Time Machine', desc: 'Historical weather lookup for any date from 1940 to present using Open-Meteo Archive API.' },
  { icon: CalendarDays, title: 'Holiday Forecast', desc: 'Real weather forecasts for upcoming Philippine holidays with category badges and aggregated statistics.' },
  { icon: CloudRain, title: 'Typhoon Tracker', desc: 'Real-time wind and pressure monitoring across Philippine regions with interactive Leaflet tracking maps.' },
  { icon: BookOpen, title: 'Weather Journal', desc: 'Personal environmental diary with auto-filled weather data, mood tracking, and statistical insights.' },
  { icon: Sparkles, title: 'Zen Mode', desc: 'Ambient nature sounds (rain, ocean, forest, fire, wind) with guided breathing exercises for relaxation.' },
  { icon: Brain, title: 'AI Weather Intelligence', desc: 'Smart clothing, travel, and health recommendations based on current conditions and air quality.' },
  { icon: Newspaper, title: 'Climate News Feed', desc: 'Latest environmental news from The Guardian and BBC Science & Environment feeds.' },
  { icon: Leaf, title: 'Environmental Analytics', desc: '7-day temperature charts, precipitation trends, weather condition breakdowns, and automated weather alerts.' },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero */}
      <div className="text-center py-6">
        <img src="/logo.png" alt="CARP" className="h-16 w-16 mx-auto mb-4 object-contain" />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>CARP</h1>
        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--primary)' }}>Climate & Air Research Platform</p>
        <p className="text-xs mt-2 max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          A comprehensive environmental data platform that monitors, analyzes, and visualizes the state of our environment 
          — from atmospheric conditions and air quality to water systems, soil health, and fire risk. 
          CARP transforms raw environmental measurements into actionable insights for individuals, communities, and researchers.
        </p>
      </div>

      {/* Mission */}
      <div className="tile">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--primary)' }}>Our Mission</h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          CARP was built to democratize access to environmental data. We believe that understanding our environment 
          — its air, water, soil, and climate — is the first step toward protecting it. By aggregating data from 
          global monitoring networks, satellite observations, and meteorological models, CARP empowers users to 
          make informed decisions about their health, safety, and impact on the planet.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Leaf className="h-3 w-3 text-emerald-400" /> Atmospheric Monitoring</span>
          <span className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-400" /> Aquatic Systems</span>
          <span className="flex items-center gap-1"><Sprout className="h-3 w-3 text-green-400" /> Terrestrial Health</span>
          <span className="flex items-center gap-1"><Sun className="h-3 w-3 text-yellow-400" /> Solar & UV Radiation</span>
        </div>
      </div>

      {/* Developers */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
          <Users className="h-4 w-4" /> Development Team
        </h2>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
          Developed by <strong>BSCpE 3C Students</strong> for the Academic Year 2025-2026 at <strong>Bulacan State University</strong>.
        </p>
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

      {/* Features */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--primary)' }}>Platform Features</h2>
        <div className="grid-tiles-2">
          {features.map(f => (
            <div key={f.title} className="tile">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(234,157,99,0.10)' }}>
                <f.icon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="mb-1 text-sm font-bold" style={{ color: 'var(--text)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="tile">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--primary)' }}>Data Sources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <p><strong style={{ color: 'var(--text)' }}>Open-Meteo</strong> — Weather forecasts, historical data, air quality, soil, marine, and flood APIs</p>
          <p><strong style={{ color: 'var(--text)' }}>Open-Meteo Air Quality</strong> — PM2.5, PM10, CO, NO₂, O₃, SO₂ pollutant monitoring</p>
          <p><strong style={{ color: 'var(--text)' }}>Open-Meteo Marine</strong> — Sea surface temperature and wave height data</p>
          <p><strong style={{ color: 'var(--text)' }}>Open-Meteo Flood</strong> — River discharge and hydrological data</p>
          <p><strong style={{ color: 'var(--text)' }}>Open-Meteo Geocoding</strong> — Global city search and reverse geocoding</p>
          <p><strong style={{ color: 'var(--text)' }}>REST Countries</strong> — Country demographics, flags, and geographic information</p>
          <p><strong style={{ color: 'var(--text)' }}>The Guardian / BBC</strong> — Climate and environmental news feeds</p>
          <p><strong style={{ color: 'var(--text)' }}>Google Gemini</strong> — AI-powered chat assistance</p>
        </div>
      </div>

      {/* Acknowledgments */}
      <div className="text-center py-4">
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          CARP — Climate & Air Research Platform · BSCpE 3C · Academic Year 2025-2026 · Bulacan State University
        </p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Built with React 19, TypeScript, Vite, Tailwind CSS, Node.js, Express, and MongoDB.
        </p>
      </div>
    </div>
  );
}
