import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, MapPin, User, Mail, Lock, Search, X, Chrome, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';
import { searchPhCities, getCitiesByRegion, getPhRegions, type PhCity } from '@/services/phCitiesApi';
import { COUNTRIES_LIST } from '@/services/countriesList';

export default function Register() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Country + City search state
  const [country, setCountry] = useState('PH');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<PhCity | null>(null);
  const [regionFilter, setRegionFilter] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState('');

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredCities = useMemo(() => {
    let results: PhCity[];
    if (cityQuery.trim().length >= 1) {
      results = searchPhCities(cityQuery);
    } else {
      results = getCitiesByRegion(regionFilter);
    }
    if (regionFilter !== 'All') {
      results = results.filter((c) => c.region === regionFilter);
    }
    return results.slice(0, 12);
  }, [cityQuery, regionFilter]);

  const handleCitySelect = (city: PhCity) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirm || !country || !selectedCity) {
      setError('Please fill in all fields including country and city');
      return;
    }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (register(name, email, password)) {
      const countryName = COUNTRIES_LIST.find(c => c.code === country)?.name || country;
      localStorage.setItem('carp_location', JSON.stringify({
        city: selectedCity.name,
        region: selectedCity.region,
        province: selectedCity.province,
        country: countryName,
        countryCode: country,
        lat: selectedCity.lat,
        lon: selectedCity.lon,
      }));
      navigate('/dashboard');
    } else { setError('Email already registered'); }
  };

  const handleGoogleSignIn = () => {
    setError('');
    const mockGoogleUser = { name: name || 'Google User', email: email || 'user@gmail.com', picture: '' };
    if (googleLogin(mockGoogleUser)) { navigate('/dashboard'); }
    else { setError('Google sign-in failed'); }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="cloud absolute" style={{ width: 400, height: 160, top: '5%', left: '-10%', animationDuration: '25s' }} />
      </div>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(234,157,99,0.05) 0%, transparent 50%)' }} />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-4 text-center">
            <CarpLogo size={44} className="mx-auto" />
          </div>

          <div className="glass-strong p-6 sm:p-8">
            <div className="mb-5 text-center">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Create Account</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Join the global climate research community</p>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all hover:bg-white/5"
              style={{ borderColor: 'var(--tile-border)', color: 'var(--text)' }}
            >
              <Chrome className="h-4 w-4 text-blue-400" />
              Sign up with Google
            </button>

            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'var(--tile-border)' }} />
              <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>or</span>
              <div className="h-px flex-1" style={{ background: 'var(--tile-border)' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="glass-input pl-11" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input pl-11" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="******" className="glass-input pl-11 pr-9" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                      {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Confirm</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="******" className="glass-input" />
                </div>
              </div>

              {/* Country Dropdown */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  <Globe className="h-3 w-3" style={{ color: 'var(--primary)' }} /> Country
                </label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="glass-select w-full"
                >
                  {COUNTRIES_LIST.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* City Search */}
              <div
                className="rounded-xl border p-3 space-y-2"
                style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>City</span>
                </div>

                <div className="relative" ref={dropdownRef}>
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={e => { setCityQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search any Philippine city..."
                    className="glass-input pl-11 pr-10"
                  />
                  {cityQuery && (
                    <button type="button" onClick={() => { setCityQuery(''); setSelectedCity(null); }} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {showDropdown && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-auto rounded-xl border shadow-2xl"
                      style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)', borderColor: 'var(--tile-border)' }}>
                      <div className="sticky top-0 flex gap-1 p-2" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--tile-border)' }}>
                        {getPhRegions().map((r) => (
                          <button key={r} type="button" onClick={(e) => { e.stopPropagation(); setRegionFilter(r); }}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all"
                            style={{ background: regionFilter === r ? 'var(--primary)' : 'transparent', color: regionFilter === r ? '#fff' : 'var(--text-muted)' }}>{r}</button>
                        ))}
                      </div>
                      {filteredCities.length > 0 ? filteredCities.map((city) => (
                        <button key={`${city.name}-${city.province}`} type="button" onClick={() => handleCitySelect(city)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--primary)]/10 border-b last:border-0"
                          style={{ borderColor: 'var(--tile-border)' }}>
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ background: 'rgba(234,157,99,0.1)' }}>
                            <MapPin className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{city.name}</p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{city.province} &middot; {city.region}</p>
                          </div>
                        </button>
                      )) : (
                        <div className="px-4 py-6 text-center"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>No cities found</p></div>
                      )}
                    </div>
                  )}
                </div>

                {selectedCity && (
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(234,157,99,0.08)', border: '1px solid rgba(234,157,99,0.2)' }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--primary)' }}>{selectedCity.name}</span>
                    <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>&middot; {selectedCity.province}</span>
                  </div>
                )}
              </div>

              {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400">{error}</div>}

              <button type="submit" className="glass-btn w-full flex items-center justify-center gap-2 py-3 text-sm font-bold">
                Create Account <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" className="font-bold" style={{ color: 'var(--primary)' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
