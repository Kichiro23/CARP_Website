import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, BarChart3, Newspaper, MapPin, Sparkles, Sun, Moon } from 'lucide-react';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';

const features = [
  { icon: Shield, title: 'Secure Access', desc: 'Protected authentication with Google OAuth and email login' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time weather data with interactive charts' },
  { icon: MapPin, title: 'Global Map', desc: 'Interactive worldwide monitoring with AQI markers' },
  { icon: Newspaper, title: 'Climate News', desc: 'Latest environmental research and updates' },
];

export default function Landing() {
  const [fade, setFade] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setTimeout(() => setFade(true), 100);
    const saved = localStorage.getItem('carp-theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    document.documentElement.style.colorScheme = initial;
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

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className={`mx-auto max-w-md transition-all duration-1000 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div
            className="p-8 text-center"
            style={{
              background: isLight ? '#ffffff' : 'rgba(20,20,30,0.5)',
              backdropFilter: isLight ? 'none' : 'blur(40px)',
              border: `1px solid ${isLight ? '#e8e8ec' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 20,
              boxShadow: isLight ? '0 4px 24px rgba(0,0,0,0.06)' : '0 8px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div className="mb-5 flex flex-col items-center gap-3">
              <CarpLogo size={80} />
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: isLight ? '#1a1a2e' : '#EAEFEF' }}>CARP</h1>
                <p className="mt-1 text-sm tracking-wide" style={{ color: isLight ? '#5a5a6e' : '#9a9da8' }}>Climate & Air Research Platform</p>
              </div>
            </div>
            <p className="mb-6 text-base font-medium" style={{ color: isLight ? '#4a4a5a' : '#C6CACA' }}>Smart Weather Insights for Better Decisions</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/login" className="glass-btn flex items-center justify-center gap-2 px-8 py-3.5">Login <ArrowRight className="h-4 w-4" /></Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors"
                style={{
                  color: '#EA9D63',
                  borderColor: 'rgba(234,157,99,0.3)',
                  background: isLight ? 'transparent' : 'transparent'
                }}
              >
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className={`mx-auto mt-10 grid max-w-4xl gap-4 transition-all delay-300 duration-1000 sm:grid-cols-2 lg:grid-cols-4 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
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

        <div className={`mt-8 transition-all delay-500 duration-1000 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-center gap-2 text-xs" style={{ color: isLight ? '#8a8a9e' : '#6b6f7a' }}>
            <Sparkles className="h-3 w-3" style={{ color: '#EA9D63' }} />
            <span>Complete Philippine city coverage &middot; Global weather monitoring &middot; AI-powered insights</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
