import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, MapPin, Clock, Thermometer, Wind, Droplets, Eye } from 'lucide-react';
import { fetchWeather } from '@/services/weatherApi';
import type { SavedLocation } from '@/hooks/useLocation';
import type { WeatherAlert } from '@/types';

interface Props { current: SavedLocation; }

const severityColor: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  medium: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  critical: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

function generateAlerts(current: any, location: string): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date().toISOString();

  if (current.temperature > 35) {
    alerts.push({ id: 'heat-' + now, type: 'heat', title: 'Extreme Heat Warning', description: `Temperature reaching ${current.temperature}C. Risk of heat exhaustion. Stay hydrated, avoid direct sun exposure between 10am-4pm, and stay in cool environments.`, severity: 'high', timestamp: now, location });
  } else if (current.temperature > 30) {
    alerts.push({ id: 'heat-' + now, type: 'heat', title: 'Heat Advisory', description: `Temperature at ${current.temperature}C. Stay hydrated and limit outdoor activities during peak hours.`, severity: 'medium', timestamp: now, location });
  }

  if (current.temperature < 5) {
    alerts.push({ id: 'cold-' + now, type: 'cold', title: 'Cold Warning', description: `Temperature dropping to ${current.temperature}C. Risk of hypothermia. Dress in warm layers and limit outdoor exposure.`, severity: 'high', timestamp: now, location });
  }

  if (current.uvIndex > 10) {
    alerts.push({ id: 'uv-' + now, type: 'uv', title: 'Extreme UV Index', description: `UV index at ${current.uvIndex} - extreme level. Skin damage can occur in minutes. Use SPF 50+ sunscreen, wear protective clothing, sunglasses, and seek shade.`, severity: 'high', timestamp: now, location });
  } else if (current.uvIndex > 7) {
    alerts.push({ id: 'uv-' + now, type: 'uv', title: 'High UV Index', description: `UV index at ${current.uvIndex}. Use sunscreen SPF 30+, wear a hat, and avoid prolonged sun exposure.`, severity: 'medium', timestamp: now, location });
  }

  if (current.windSpeed > 50) {
    alerts.push({ id: 'wind-' + now, type: 'storm', title: 'Severe Wind Warning', description: `Wind speeds up to ${current.windSpeed} km/h. Dangerous conditions - secure outdoor objects, avoid trees and power lines.`, severity: 'critical', timestamp: now, location });
  } else if (current.windSpeed > 30) {
    alerts.push({ id: 'wind-' + now, type: 'storm', title: 'Strong Wind Advisory', description: `Wind speeds reaching ${current.windSpeed} km/h. Secure loose outdoor items and exercise caution.`, severity: 'medium', timestamp: now, location });
  }

  if (current.precipitation > 10) {
    alerts.push({ id: 'rain-' + now, type: 'rain', title: 'Heavy Rain Alert', description: `Heavy precipitation of ${current.precipitation}mm expected. Risk of flooding in low-lying areas. Avoid unnecessary travel.`, severity: 'high', timestamp: now, location });
  } else if (current.precipitation > 2) {
    alerts.push({ id: 'rain-' + now, type: 'rain', title: 'Rain Advisory', description: `Precipitation of ${current.precipitation}mm expected. Carry an umbrella and drive carefully.`, severity: 'low', timestamp: now, location });
  }

  if (current.visibility < 1) {
    alerts.push({ id: 'fog-' + now, type: 'fog', title: 'Low Visibility Warning', description: `Visibility reduced to ${current.visibility}km. Dangerous driving conditions. Use fog lights and reduce speed.`, severity: 'high', timestamp: now, location });
  }

  if (current.humidity > 85 && current.temperature > 25) {
    alerts.push({ id: 'humid-' + now, type: 'heat', title: 'High Humidity Alert', description: `Humidity at ${current.humidity}% with ${current.temperature}C temperature. Heat index is significantly higher. Stay hydrated and cool.`, severity: 'medium', timestamp: now, location });
  }

  return alerts;
}

const alertIcon: Record<string, any> = { heat: Thermometer, cold: Thermometer, uv: Eye, storm: Wind, rain: Droplets, fog: Wind };

export default function Alerts({ current }: Props) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const w = await fetchWeather(current.lat, current.lng);
      if (w) {
        const generated = generateAlerts(w.current, current.name);
        setAlerts(generated);
        setLastUpdated(new Date());
      } else {
        setAlerts([]);
      }
    } catch { setAlerts([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [current.lat, current.lng]);

  if (loading) return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Weather Alerts</h1><div className="skeleton mt-1 h-4 w-48" /></div>
      <div className="space-y-3">{[1, 2].map(i => <div key={i} className="tile"><div className="skeleton h-4 w-1/3 mb-2" /><div className="skeleton h-3 w-full" /></div>)}</div>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Weather Alerts</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />{current.name}, {current.country}</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}><Clock className="mr-1 inline h-3 w-3" />{lastUpdated.toLocaleTimeString()}</span>}
          <button onClick={load} className="glass-badge cursor-pointer"><RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh</button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="tile text-center py-12">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.10)' }}>
            <AlertTriangle className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>All Clear</h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>No active weather alerts for {current.name}. Conditions are safe.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(a => {
            const Icon = alertIcon[a.type] || AlertTriangle;
            const sc = severityColor[a.severity] || severityColor.low;
            return (
              <div key={a.id} className={`tile ${sc.bg}`} style={{ borderLeft: `4px solid`, borderLeftColor: a.severity === 'critical' ? '#9B59B6' : a.severity === 'high' ? '#EF4444' : a.severity === 'medium' ? '#F97316' : '#3B82F6' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 shrink-0 ${sc.text}`} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{a.title}</h3>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${sc.bg} ${sc.text} ${sc.border}`}>
                    {a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="h-3 w-3" />{new Date(a.timestamp).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
