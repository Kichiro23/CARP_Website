import { useState, useEffect } from 'react';
import { RefreshCw, MapPin, AlertTriangle, Activity, Wind, HelpCircle } from 'lucide-react';
import { fetchAirQuality, fetchWeather, aqiColor, pm25Class } from '@/services/weatherApi';
import { Line } from 'react-chartjs-2';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props { current: SavedLocation; }

export default function AirQuality({ current }: Props) {
  const [data, setData] = useState<{ pm25: number; pm10: number; co: number; no2: number; o3: number; so2: number; aqi: number } | null>(null);
  const [weather, setWeather] = useState<{ hourly: Array<{ time: string; temperature: number; precipitationProbability: number }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [aq, r] = await Promise.all([
        fetchAirQuality(current.lat, current.lng),
        fetchWeather(current.lat, current.lng),
      ]);
      setData(aq);
      setWeather(r ? { hourly: r.hourly } : null);
      if (!aq) setError('Could not load air quality data.');
    } catch { setError('Failed to load data.'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [current.lat, current.lng]);

  const aqiLabels = ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Hazardous'];
  const aqiDesc = [
    'Air quality is satisfactory. Enjoy outdoor activities.',
    'Acceptable, but sensitive individuals should limit prolonged outdoor exertion.',
    'Sensitive groups may experience health effects. Limit outdoor activities.',
    'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion.',
    'Health alert: everyone may experience serious health effects. Stay indoors.',
  ];

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: '#9a9da8', maxTicksLimit: 8, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
              y: { ticks: { color: '#9a9da8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } } } };

  if (loading) return (
    <div className="space-y-4">
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Air Quality</h1><div className="skeleton mt-1 h-4 w-48" /></div>
      <div className="skeleton h-40 w-full" />
      <div className="grid-tiles-3">{[1,2,3,4,5,6].map(i => <div key={i} className="tile"><div className="skeleton h-4 w-1/2 mb-2" /><div className="skeleton h-6 w-3/4" /></div>)}</div>
    </div>
  );

  if (error || !data) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error || 'No data available'}</p>
      <button onClick={load} className="glass-btn px-5 py-2 text-xs"><RefreshCw className="mr-1 h-3 w-3" /> Retry</button>
    </div>
  );

  const pollutants = [
    { label: 'PM2.5', value: data.pm25, unit: 'ug/m3', desc: 'Fine particles (<2.5nm). Penetrates deep into lungs. Major health risk.', color: aqiColor(data.pm25), badge: pm25Class(data.pm25) },
    { label: 'PM10', value: data.pm10, unit: 'ug/m3', desc: 'Coarse particles (<10nm). Can irritate eyes and throat.', color: '#A2B7C7', badge: null },
    { label: 'CO', value: data.co, unit: 'mg/m3', desc: 'Carbon monoxide. Toxic gas from burning fuel. Can cause headaches and dizziness.', color: '#A2B7C7', badge: null },
    { label: 'NO2', value: data.no2, unit: 'ug/m3', desc: 'Nitrogen dioxide. From vehicle exhaust and industry. Can irritate airways.', color: '#A2B7C7', badge: null },
    { label: 'O3', value: data.o3, unit: 'ug/m3', desc: 'Ozone. Ground-level ozone is harmful. Can trigger asthma and lung damage.', color: '#A2B7C7', badge: null },
    { label: 'SO2', value: data.so2, unit: 'ug/m3', desc: 'Sulfur dioxide. From fossil fuel burning. Can cause respiratory issues.', color: '#A2B7C7', badge: null },
  ];

  const aqiC = aqiColor(data.pm25);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Air Quality</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />{current.name}, {current.country}</p>
        </div>
        <button onClick={load} className="glass-badge cursor-pointer"><RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh</button>
      </div>

      <div className="tile text-center" style={{ background: 'linear-gradient(135deg, ' + aqiC + '10, transparent)' }}>
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: aqiC + '20', border: '3px solid ' + aqiC }}>
          <Activity className="h-8 w-8" style={{ color: aqiC }} />
        </div>
        <p className="text-5xl font-extrabold" style={{ color: aqiC }}>{data.aqi}</p>
        <p className="mt-1 text-base font-bold" style={{ color: 'var(--text)' }}>{aqiLabels[Math.min(data.aqi - 1, 4)] || 'Unknown'}</p>
        <p className="mt-1 max-w-md mx-auto text-xs" style={{ color: 'var(--text-secondary)' }}>{aqiDesc[Math.min(data.aqi - 1, 4)] || ''}</p>
        <div className="mt-3 flex justify-center gap-1.5">
          {[1,2,3,4,5].map(i => <div key={i} className="h-2.5 w-10 rounded-full" style={{ background: i <= data.aqi ? aqiC : 'rgba(255,255,255,0.06)' }} />)}
        </div>
      </div>

      <div className="grid-tiles-3">
        {pollutants.map(p => (
          <div key={p.label} className="tile">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{p.label}</span>
              {p.badge && <span className={'rounded-md px-2 py-0.5 text-[10px] font-bold ' + p.badge}>
                {p.value <= 12 ? 'Good' : p.value <= 35 ? 'Moderate' : p.value <= 55 ? 'Unhealthy' : 'Hazardous'}
              </span>}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-3xl font-extrabold" style={{ color: p.color }}>{Math.round(p.value * 10) / 10}</p>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{p.unit}</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
            {p.label === 'PM2.5' && (
              <div className="mt-3">
                <div className="h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: Math.min(100, (p.value / 150) * 100) + '%', background: aqiColor(p.value) }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {weather && (
        <div className="tile">
          <div className="mb-3 flex items-center gap-2"><Wind className="h-4 w-4" style={{ color: 'var(--primary)' }} /><h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Temperature Trend (24H)</h3></div>
          <div className="h-[180px]">
            <Line data={{ labels: weather.hourly.slice(0, 24).map(h => h.time.slice(11, 16)),
              datasets: [{ data: weather.hourly.slice(0, 24).map(h => h.temperature), borderColor: '#EA9D63', backgroundColor: '#EA9D6312', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }] }} options={chartOpts} />
          </div>
        </div>
      )}

      <div className="tile">
        <h3 className="tile-title flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Understanding Air Quality Units</h3>
        <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <p><strong style={{ color: 'var(--text)' }}>PM2.5 &amp; PM10 (ug/m3):</strong> Micrograms per cubic meter. Smaller than 2.5nm (PM2.5) or 10nm (PM10). Since they are so small, they can enter the bloodstream and cause cardiovascular and respiratory problems.</p>
          <p><strong style={{ color: 'var(--text)' }}>CO (mg/m3):</strong> Milligrams per cubic meter. Carbon monoxide is a toxic gas with no color or smell. High levels reduce oxygen delivery in the blood.</p>
          <p><strong style={{ color: 'var(--text)' }}>NO2, O3, SO2 (ug/m3):</strong> Micrograms per cubic meter. Nitrogen dioxide, ozone, and sulfur dioxide are gases that can irritate airways, harm lungs, and cause respiratory distress.</p>
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>Data from Open-Meteo Air Quality API. Updated in real-time for {current.name}.</p>
        </div>
      </div>
    </div>
  );
}
