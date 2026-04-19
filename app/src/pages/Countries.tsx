import { useState, useEffect } from 'react';
import { Search, Globe } from 'lucide-react';
import { fetchCountries, searchCities, getCitiesByRegion, MAJOR_CITIES } from '@/services/countriesApi';
import { REGIONS } from '@/config/api';
import type { Country, City } from '@/types';

function SkeletonTable() {
  return <div className="tile space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36 }} />)}</div>;
}

export default function Countries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => { fetchCountries().then(d => { setCountries(d); setLoading(false); }); }, []);
  useEffect(() => {
    if (search.length >= 2) { searchCities(search).then(setSearchResults); setShowResults(true); }
    else { setSearchResults([]); setShowResults(false); }
  }, [search]);

  const filteredCities = activeRegion === 'All' ? MAJOR_CITIES : getCitiesByRegion(activeRegion);

  if (loading) return <div className="space-y-4"><SkeletonTable /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Countries & Cities</h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{countries.length} countries, {MAJOR_CITIES.length} monitored cities</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search cities or countries..." className="glass-input pl-11" />
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-52 overflow-auto glass-strong shadow-2xl rounded-xl">
            {searchResults.map(c => (
              <div key={`${c.name}-${c.country}`} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--tile-border)' }}>
                <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                <div className="min-w-0"><p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{c.name}</p><p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.country} &bull; {c.region}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regions */}
      <div className="flex flex-wrap gap-2">
        {REGIONS.map(r => (
          <button key={r} onClick={() => setActiveRegion(r)} className={`glass-tab text-xs ${activeRegion === r ? 'active' : ''}`}>{r}</button>
        ))}
      </div>

      {/* Cities */}
      <div className="tile !p-0 overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--tile-border)' }}>
          <h3 className="tile-title !mb-0">Monitored Cities ({filteredCities.length})</h3>
        </div>
        <div className="max-h-[360px] overflow-auto">
          {filteredCities.map(city => (
            <div key={city.name} className="flex items-center justify-between px-5 py-3 border-b last:border-0 hover:bg-[var(--primary)]/5 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="tile-icon !h-8 !w-8 !mb-0" style={{ background: 'rgba(234,157,99,0.08)' }}>
                  <Globe className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="min-w-0"><p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{city.name}</p><p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{city.country}</p></div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="glass-badge text-[10px]" style={{ color: 'var(--primary)' }}>{city.region}</span>
                {city.population && <span className="hidden text-xs sm:inline" style={{ color: 'var(--text-muted)' }}>{(city.population / 1000000).toFixed(1)}M</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Countries Table */}
      <div className="tile !p-0 overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--tile-border)' }}>
          <h3 className="tile-title !mb-0">All Countries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Country', 'Capital', 'Region', 'Population'].map(h => <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--primary)' }}>{h}</th>)}
            </tr></thead>
            <tbody>{countries.slice(0, 50).map(c => (
              <tr key={c.code} className="border-b last:border-0 hover:bg-[var(--primary)]/5 transition-colors" style={{ borderColor: 'var(--tile-border)' }}>
                <td className="px-5 py-2.5"><div className="flex items-center gap-2 min-w-0">
                  {c.flag ? <img src={c.flag} alt="" className="h-3.5 w-5 rounded-sm object-cover shrink-0" /> : <Globe className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />}
                  <span className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{c.name}</span>
                </div></td>
                <td className="px-5 py-2.5 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{c.capital}</td>
                <td className="px-5 py-2.5"><span className="glass-badge text-[10px]" style={{ color: 'var(--primary)' }}>{c.region}</span></td>
                <td className="px-5 py-2.5 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{(c.population / 1000000).toFixed(1)}M</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
