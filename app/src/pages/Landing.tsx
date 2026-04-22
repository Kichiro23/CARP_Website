import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, BarChart3, MapPin, Sparkles, Sun, Moon, Droplets, Sprout, Flame, Users, Globe, Clock } from 'lucide-react';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';

const features = [
  { icon: Globe, title: 'Global Environmental Data', desc: 'Real-time weather, air quality, water systems, soil health, and fire risk from Open-Meteo and global monitoring networks.' },
  { icon: Shield, title: 'Air Quality Monitoring', desc: 'Track PM2.5, PM10, CO, NO₂, O₃, SO₂ with AQI classification, 24-hour forecasts, and health recommendations.' },
  { icon: BarChart3, title: 'Analytics & Insights', desc: 'Interactive charts, historical trends, city comparisons, typhoon tracking, and AI-powered weather intelligence.' },
  { icon: MapPin, title: 'Interactive Live Map', desc: 'Global map with AQI markers, precipitation radar, cloud cover overlays, and weather detail panels.' },
  { icon: Droplets, title: 'Water & Marine Systems', desc: 'Sea surface temperature, wave height, and river discharge monitoring for aquatic environmental health.' },
  { icon: Sprout, title: 'Soil & Agriculture', desc: 'Soil moisture and temperature with agricultural insights for crop management and drought assessment.' },
  { icon: Flame, title: 'Wildfire Risk Assessment', desc: 'Fire risk calculator based on temperature, humidity, wind, and evapotranspiration data.' },
  { icon: Users, title: 'Personal Tools', desc: 'Weather journal, ambient nature sounds, guided breathing, and embeddable weather widgets.' },
];

// World population estimate based on ~2.5 births/sec and ~1.0 deaths/sec
// Reference: ~8.1 billion as of early 2024
const POPULATION_BASE = 8_100_000_000;
const POPULATION_REFERENCE_TIME = 1704067200000; // Jan 1, 2024
const NET_GROWTH_PER_SECOND = 2.3;

function getWorldPopulation(): number {
  const elapsedSeconds = (Date.now() - POPULATION_REFERENCE_TIME) / 1000;
  return Math.floor(POPULATION_BASE + elapsedSeconds * NET_GROWTH_PER_SECOND);
}

function formatPopulation(n: number): string {
  return n.toLocaleString('en-US');
}

const TIMEZONES = [
  { label: 'Manila', zone: 'Asia/Manila' },
  { label: 'UTC', zone: 'UTC' },
  { label: 'New York', zone: 'America/New_York' },
  { label: 'London', zone: 'Europe/London' },
  { label: 'Tokyo', zone: 'Asia/Tokyo' },
];

export default function Landing() {
  const [fade, setFade] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [population, setPopulation] = useState(getWorldPopulation());
  const [clocks, setClocks] = useState<string[]>(TIMEZONES.map(() => ''));

  useEffect(() => {
    setTimeout(() => setFade(true), 100);
    const saved = localStorage.getItem('carp-theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    document.documentElement.style.colorScheme = initial;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPopulation(getWorldPopulation());
      setClocks(TIMEZONES.map(tz => new Date().toLocaleTimeString('en-US', {
        timeZone: tz.zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('carp-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
  };

  const isLight = theme === 'light';

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: isLight ? '#ffffff' : '#0a0e1a' }}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay loop muted playsInline
          className="h-full w-full object-cover"
          style={{ opacity: isLight ? 0.15 : 0.7, filter: isLight ? 'brightness(2.5) contrast(0.6)' : 'none' }}
        >
          <source src="/videos/clouds.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background: isLight
              ? 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 40%, #eef1f5 100%)'
              : 'linear-gradient(180deg, rgba(10,10,18,0.65) 0%, rgba(10,10,18,0.5) 40%, rgba(10,10,18,0.75) 100%)'
          }}
        />
      </div>

      {/* Theme Toggle */}
      <div className="relative z-20 flex justify-end px-6 pt-5">
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: isLight ? '#f0f1f5' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isLight ? '#e2e4e9' : 'rgba(255,255,255,0.1)'}`,
            color: isLight ? '#555567' : '#9a9da8'
          }}
          title={isLight ? 'Switch to Dark' : 'Switch to Light'}
        >
          {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className={`mx-auto max-w-md transition-all duration-1000 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div
            className="p-6 sm:p-8 text-center"
            style={{
              background: isLight ? '#ffffff' : 'rgba(20,20,30,0.5)',
              backdropFilter: isLight ? 'none' : 'blur(40px)',
              border: `1px solid ${isLight ? '#e8e8ec' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 20,
              boxShadow: isLight ? '0 4px 24px rgba(0,0,0,0.06)' : '0 8px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div className="mb-4 flex flex-col items-center gap-3">
              <CarpLogo size={72} />
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: isLight ? '#1a1a2e' : '#EAEFEF' }}>CARP</h1>
                <p className="mt-1 text-xs sm:text-sm tracking-wide" style={{ color: isLight ? '#5a5a6e' : '#9a9da8' }}>Climate & Air Research Platform</p>
              </div>
            </div>

            {/* World Population */}
            <div className="mb-4 rounded-xl border p-3" style={{ borderColor: isLight ? '#e8e8ec' : 'rgba(255,255,255,0.08)', background: isLight ? '#f8f9fa' : 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#EA9D63' }}>World Population</p>
              <p className="text-lg sm:text-xl font-bold tabular-nums" style={{ color: isLight ? '#1a1a2e' : '#EAEFEF' }}>{formatPopulation(population)}</p>
              <p className="text-[9px]" style={{ color: isLight ? '#8a8a9e' : '#6b6f7a' }}>Live estimate · ~2.3 people/sec</p>
            </div>

            {/* World Clocks */}
            <div className="mb-4 grid grid-cols-5 gap-1">
              {TIMEZONES.map((tz, i) => (
                <div key={tz.label} className="text-center rounded-lg border p-1.5" style={{ borderColor: isLight ? '#e8e8ec' : 'rgba(255,255,255,0.06)', background: isLight ? '#f8f9fa' : 'rgba(255,255,255,0.02)' }}>
                  <Clock className="mx-auto h-3 w-3 mb-0.5" style={{ color: '#EA9D63' }} />
                  <p className="text-[9px] font-bold" style={{ color: isLight ? '#1a1a2e' : '#EAEFEF' }}>{clocks[i] || '--:--:--'}</p>
                  <p className="text-[7px]" style={{ color: isLight ? '#8a8a9e' : '#6b6f7a' }}>{tz.label}</p>
                </div>
              ))}
            </div>

            <p className="mb-5 text-sm sm:text-base font-medium" style={{ color: isLight ? '#4a4a5a' : '#C6CACA' }}>
              Environmental data for a healthier planet. Monitor air, water, soil, and climate in real time.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/login" className="glass-btn flex items-center justify-center gap-2 px-8 py-3.5">Login <ArrowRight className="h-4 w-4" /></Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors"
                style={{
                  color: '#EA9D63',
                  borderColor: 'rgba(234,157,99,0.3)',
                  background: 'transparent'
                }}
              >
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className={`mx-auto mt-8 grid max-w-5xl gap-3 transition-all delay-300 duration-1000 sm:grid-cols-2 lg:grid-cols-4 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {features.map(f => (
            <div
              key={f.title}
              className="tile text-left"
              style={{
                background: isLight ? '#f8f9fa' : 'rgba(20,20,30,0.5)',
                backdropFilter: isLight ? 'none' : 'blur(16px)',
                border: `1px solid ${isLight ? '#e8e8ec' : 'rgba(255,255,255,0.10)'}`,
                boxShadow: isLight ? 'none' : undefined
              }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(234,157,99,0.10)' }}>
                <f.icon className="h-5 w-5" style={{ color: '#EA9D63' }} />
              </div>
              <h3 className="mb-1 text-sm font-bold" style={{ color: isLight ? '#1a1a2e' : '#EAEFEF' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: isLight ? '#5a5a6e' : '#9a9da8' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className={`mt-6 transition-all delay-500 duration-1000 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-center gap-2 text-xs text-center" style={{ color: isLight ? '#8a8a9e' : '#6b6f7a' }}>
            <Sparkles className="h-3 w-3 shrink-0" style={{ color: '#EA9D63' }} />
            <span>Atmospheric · Aquatic · Terrestrial · Risk Assessment</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
