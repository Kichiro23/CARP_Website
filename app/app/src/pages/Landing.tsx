import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Shield, BarChart3, Newspaper, MapPin, Sparkles } from 'lucide-react';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';
import VideoBackground from '@/components/VideoBackground';

export default function Landing() {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFade(true), 100);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: Shield, title: 'Secure Access', desc: 'Protected authentication with Google OAuth and email login' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time weather data with interactive charts' },
    { icon: MapPin, title: 'Global Map', desc: 'Interactive worldwide monitoring with AQI markers' },
    { icon: Newspaper, title: 'Climate News', desc: 'Latest environmental research and updates' },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: '#0a0e1a' }}>
      {/* ===== VIDEO BACKGROUND ===== */}
      <VideoBackground opacity={0.7} />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto w-full max-w-6xl text-center">
          {/* Glass Card */}
          <div className={`mx-auto max-w-md transition-all duration-1000 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div
              style={{
                background: 'rgba(20,20,30,0.60)',
                backdropFilter: 'blur(24px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                padding: '40px 32px',
              }}
            >
              {/* Logo */}
              <div className="mb-5 flex flex-col items-center gap-3">
                <CarpLogo size={80} className="drop-shadow-[0_0_24px_rgba(234,157,99,0.35)]" />
                <div>
                  <h1
                    className="text-4xl font-extrabold tracking-tight"
                    style={{ color: '#EAEFEF', letterSpacing: '-0.03em' }}
                  >
                    CARP
                  </h1>
                  <p
                    className="mt-1 text-sm font-medium tracking-wide"
                    style={{ color: '#9a9da8' }}
                  >
                    Climate &amp; Air Research Platform
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <p className="mb-6 text-base font-medium" style={{ color: '#C6CACA' }}>
                Smart Weather Insights for Better Decisions
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/login"
                  className="glass-btn flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold uppercase tracking-wider"
                >
                  Login <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-bold uppercase tracking-wider transition-all hover:bg-white/5"
                  style={{ color: '#EA9D63', borderColor: 'rgba(234,157,99,0.3)' }}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div
            className={`mx-auto mt-10 grid max-w-4xl gap-4 transition-all delay-300 duration-1000 sm:grid-cols-2 lg:grid-cols-4 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="tile text-left"
                style={{
                  background: 'rgba(20,20,30,0.50)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(234,157,99,0.10)' }}
                >
                  <f.icon className="h-5 w-5" style={{ color: '#EA9D63' }} />
                </div>
                <h3 className="mb-1 text-sm font-bold" style={{ color: '#EAEFEF' }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#9a9da8' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Credits */}
          <div
            className={`mt-8 transition-all delay-500 duration-1000 ${fade ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#6b6f7a' }}>
              <Sparkles className="h-3 w-3" style={{ color: '#EA9D63' }} />
              <span className="break-words">
                Complete Philippine city coverage &middot; Global weather monitoring &middot; AI-powered insights
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
