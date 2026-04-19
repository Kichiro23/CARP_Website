import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, Globe, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password'); return; }
    if (login(email, password)) { navigate('/dashboard'); } else { setError('Invalid email or password'); }
  };

  const handleGoogleSignIn = () => {
    setError('');
    const mockGoogleUser = {
      name: 'Google User',
      email: 'user@gmail.com',
      picture: '',
    };
    if (googleLogin(mockGoogleUser)) { navigate('/dashboard'); }
    else { setError('Google sign-in failed'); }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="cloud absolute" style={{ width: 400, height: 160, top: '5%', left: '-10%', animationDuration: '25s' }} />
      </div>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(234,157,99,0.05) 0%, transparent 50%)' }} />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 text-center">
            <CarpLogo size={48} className="mx-auto" />
          </div>

          <div className="glass-strong p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Sign In</h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Access your CARP dashboard</p>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-white/5"
              style={{ borderColor: 'var(--tile-border)', color: 'var(--text)' }}
            >
              <Chrome className="h-4 w-4 text-blue-400" />
              Sign in with Google
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'var(--tile-border)' }} />
              <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>or</span>
              <div className="h-px flex-1" style={{ background: 'var(--tile-border)' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input pl-11" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="glass-input pr-11" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400">{error}</div>}

              <button type="submit" className="glass-btn w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold">
                Sign In <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-5 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account? <Link to="/register" className="font-bold" style={{ color: 'var(--primary)' }}>Register</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
