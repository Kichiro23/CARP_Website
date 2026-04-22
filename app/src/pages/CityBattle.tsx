import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Swords, Trophy, Crown, RotateCcw } from 'lucide-react';
import CitySearch from '@/components/CitySearch';
import { fetchWeather, fetchPM25, wmoEmoji, wmoLabel } from '@/services/weatherApi';
import type { WeatherData } from '@/types';

interface CityData {
  name: string;
  country: string;
  weather: WeatherData | null;
  pm25: number | null;
}

function getScore(c: CityData): number {
  if (!c.weather) return 0;
  let s = 50;
  s += c.weather.current.temperature;
  s += c.weather.current.humidity * 0.3;
  s += c.weather.current.windSpeed * 0.5;
  s -= (c.pm25 || 0) * 0.5;
  return Math.round(s);
}

export default function CityBattle() {
  const [cityA, setCityA] = useState<CityData | null>(null);
  const [cityB, setCityB] = useState<CityData | null>(null);
  const [, setLoading] = useState(false);
  const [battling, setBattling] = useState(false);

  const handleSelectA = async (city: { name: string; country: string; lat: number; lng: number }) => {
    setLoading(true);
    const [w, p] = await Promise.all([fetchWeather(city.lat, city.lng), fetchPM25(city.lat, city.lng)]);
    setCityA({ name: city.name, country: city.country, weather: w, pm25: p });
    setLoading(false);
  };

  const handleSelectB = async (city: { name: string; country: string; lat: number; lng: number }) => {
    setLoading(true);
    const [w, p] = await Promise.all([fetchWeather(city.lat, city.lng), fetchPM25(city.lat, city.lng)]);
    setCityB({ name: city.name, country: city.country, weather: w, pm25: p });
    setLoading(false);
  };

  const startBattle = () => { setBattling(true); };
  const reset = () => { setCityA(null); setCityB(null); setBattling(false); };

  const scoreA = cityA ? getScore(cityA) : 0;
  const scoreB = cityB ? getScore(cityB) : 0;
  const winner = battling ? (scoreA > scoreB ? cityA : cityB) : null;

  const StatBar = ({ label, a, b, unit, invert }: { label: string; a: number; b: number; unit: string; invert?: boolean }) => {
    const max = Math.max(a, b) || 1;
    const pctA = (a / max) * 100;
    const pctB = (b / max) * 100;
    const aWins = invert ? a < b : a > b;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}><span>{label}</span></div>
        <div className="flex items-center gap-2">
          <div className="flex-1"><div className="h-2 rounded-full" style={{ background: 'var(--tile-bg)', border: '1px solid var(--tile-border)' }}><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pctA}%`, background: aWins ? '#5CB85C' : '#D9534F' }} /></div></div>
          <span className="w-12 text-right text-xs font-bold" style={{ color: 'var(--text)' }}>{a}{unit}</span>
          <Swords className="h-3 w-3 shrink-0" style={{ color: 'var(--primary)' }} />
          <span className="w-12 text-left text-xs font-bold" style={{ color: 'var(--text)' }}>{b}{unit}</span>
          <div className="flex-1"><div className="h-2 rounded-full" style={{ background: 'var(--tile-bg)', border: '1px solid var(--tile-border)' }}><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pctB}%`, background: !aWins ? '#5CB85C' : '#D9534F' }} /></div></div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard</Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>City Battle ⚔️</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pick two cities and watch them face off</p>
      </div>

      {/* City Selectors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="tile">
          <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--primary)' }}>Challenger A</h3>
          {cityA ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cityA.weather ? wmoEmoji(cityA.weather.current.weatherCode) : '❓'}</span>
              <div><p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{cityA.name}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{cityA.country}</p></div>
              <button onClick={() => setCityA(null)} className="ml-auto text-[10px] text-red-400 hover:underline">Change</button>
            </div>
          ) : (
            <CitySearch onSelect={handleSelectA} placeholder="Search City A..." />
          )}
        </div>
        <div className="tile">
          <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--primary)' }}>Challenger B</h3>
          {cityB ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cityB.weather ? wmoEmoji(cityB.weather.current.weatherCode) : '❓'}</span>
              <div><p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{cityB.name}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{cityB.country}</p></div>
              <button onClick={() => setCityB(null)} className="ml-auto text-[10px] text-red-400 hover:underline">Change</button>
            </div>
          ) : (
            <CitySearch onSelect={handleSelectB} placeholder="Search City B..." />
          )}
        </div>
      </div>

      {/* Battle Button */}
      {cityA && cityB && !battling && (
        <button onClick={startBattle} className="glass-btn w-full flex items-center justify-center gap-2 py-4 text-lg">
          <Swords className="h-5 w-5" /> START BATTLE
        </button>
      )}
      {battling && (
        <button onClick={reset} className="w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold uppercase tracking-wider" style={{ borderColor: 'var(--tile-border)', color: 'var(--text-secondary)' }}>
          <RotateCcw className="h-4 w-4" /> Battle Again
        </button>
      )}

      {/* Battle Results */}
      {battling && cityA?.weather && cityB?.weather && (
        <div className="space-y-4">
          {/* Winner Banner */}
          {winner && (
            <div className="flex flex-col items-center rounded-xl border p-6 text-center" style={{ background: 'rgba(234,157,99,0.08)', borderColor: 'rgba(234,157,99,0.25)' }}>
              <Crown className="mb-2 h-8 w-8" style={{ color: 'var(--primary)' }} />
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--primary)' }}>{winner.name} Wins!</h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{winner.name} scored {winner === cityA ? scoreA : scoreB} vs {winner === cityA ? scoreB : scoreA}</p>
            </div>
          )}

          {/* Stats */}
          <div className="tile space-y-3">
            <h3 className="tile-title">Battle Stats</h3>
            <StatBar label="Temperature" a={cityA.weather.current.temperature} b={cityB.weather.current.temperature} unit="°C" />
            <StatBar label="Humidity" a={cityA.weather.current.humidity} b={cityB.weather.current.humidity} unit="%" />
            <StatBar label="Wind Speed" a={cityA.weather.current.windSpeed} b={cityB.weather.current.windSpeed} unit=" km/h" />
            <StatBar label="UV Index" a={cityA.weather.current.uvIndex} b={cityB.weather.current.uvIndex} unit="" />
            <StatBar label="PM2.5 (lower is better)" a={cityA.pm25 || 0} b={cityB.pm25 || 0} unit="" invert />
          </div>

          {/* Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="tile text-center" style={{ border: winner === cityA ? '2px solid #5CB85C' : undefined }}>
              <p className="text-3xl mb-1">{wmoEmoji(cityA.weather.current.weatherCode)}</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{cityA.weather.current.temperature}°C</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{wmoLabel(cityA.weather.current.weatherCode)}</p>
              {winner === cityA && <span className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-emerald-400" style={{ background: 'rgba(92,184,92,0.12)' }}><Trophy className="h-3 w-3" /> Winner</span>}
            </div>
            <div className="tile text-center" style={{ border: winner === cityB ? '2px solid #5CB85C' : undefined }}>
              <p className="text-3xl mb-1">{wmoEmoji(cityB.weather.current.weatherCode)}</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{cityB.weather.current.temperature}°C</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{wmoLabel(cityB.weather.current.weatherCode)}</p>
              {winner === cityB && <span className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-emerald-400" style={{ background: 'rgba(92,184,92,0.12)' }}><Trophy className="h-3 w-3" /> Winner</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
