import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Globe, Chrome } from 'lucide-react';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';
import VideoBackground from '@/components/VideoBackground';

export default function Login({ login }: { login: (e: string, p: string) => Promise<void> }) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password'); return; }
    try { await login(email, password); nav('/dashboard'); }
    catch (err: any) { setError(err.message || 'Login failed'); }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <VideoBackground opacity={0.55} />
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <CarpLogo size={72} />
            <div><h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>CARP</h1>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Climate & Air Research Platform</p></div>
          </div>
          <div className="glass-strong p-6 sm:p-8">
            <div className="mb-6 text-center"><h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Sign In</h2>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Access your CARP dashboard</p></div>
            <button type="button" onClick={() => { setError(''); setError('Google OAuth requires setup. See docs.'); }} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold hover:bg-white/5" style={{ borderColor: 'var(--tile-border)', color: 'var(--text)' }}>
              <Chrome className="h-4 w-4 text-blue-400" /> Sign in with Google
            </button>
            <div className="mb-4 flex items-center gap-3"><div className="h-px flex-1" style={{ background: 'var(--tile-border)' }} /><span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>or</span><div className="h-px flex-1" style={{ background: 'var(--tile-border)' }} /></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative"><Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input" style={{ paddingLeft: 44 }} /></div></div>
              <div><label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative"><input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="glass-input" style={{ paddingRight: 36 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400 break-words">{error}</div>}
              <button type="submit" className="glass-btn w-full flex items-center justify-center gap-2 py-3.5">Sign In <ArrowRight className="h-4 w-4" /></button>
            </form>
            <div className="mt-4 flex items-center justify-between text-xs">
              <Link to="/forgot-password" className="font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>Forgot password?</Link>
              <span style={{ color: 'var(--text-secondary)' }}>No account? <Link to="/register" className="font-bold" style={{ color: 'var(--primary)' }}>Register</Link></span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
