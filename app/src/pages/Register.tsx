import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';
import VideoBackground from '@/components/VideoBackground';

interface Props {
  register: (n: string, e: string, p: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
}

export default function Register({ register, googleLogin }: Props) {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredData, setRegisteredData] = useState<{ name: string; email: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      setRegisteredData({ name, email });
      setRegistered(true);
    } catch (err: any) { setError(err.message || 'Registration failed'); }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      nav('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign up failed');
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    nav('/dashboard');
  };

  const handleGoBack = () => {
    setRegistered(false);
    setRegisteredData(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <VideoBackground opacity={0.55} />
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-4 flex flex-col items-center gap-2 text-center">
            <CarpLogo size={64} />
            <div><h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>CARP</h1>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Climate & Air Research Platform</p></div>
          </div>
          <div className="glass-strong p-6 sm:p-8">

            {!registered ? (
              <>
                <div className="mb-4"><Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In</Link></div>
                <div className="mb-5 text-center"><h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Create Account</h2>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Join the climate research community</p></div>

                <div className="mb-4 flex justify-center">
                  <div className="w-full max-w-[300px] overflow-hidden">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google sign up failed')}
                      size="large"
                      text="signup_with"
                      shape="rectangular"
                      theme="filled_black"
                      width="300"
                    />
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-3"><div className="h-px flex-1" style={{ background: 'var(--tile-border)' }} /><span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>or</span><div className="h-px flex-1" style={{ background: 'var(--tile-border)' }} /></div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                    <div className="relative"><User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="glass-input" style={{ paddingLeft: 44 }} /></div></div>
                  <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input" style={{ paddingLeft: 44 }} /></div></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Password</label>
                      <div className="relative"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="******" className="glass-input" style={{ paddingLeft: 44, paddingRight: 36 }} />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div></div>
                    <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Confirm</label>
                      <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="******" className="glass-input" /></div></div>
                  {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400 break-words">{error}</div>}
                  <button type="submit" disabled={loading} className="glass-btn w-full flex items-center justify-center gap-2 py-3">{loading ? 'Creating account...' : <>Create Account <ArrowRight className="h-4 w-4" /></>}</button>
                </form>
                <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>Already have an account? <Link to="/login" className="font-bold" style={{ color: 'var(--primary)' }}>Sign In</Link></p>
              </>
            ) : (
              <>
                {/* Email Confirmation Step */}
                <div className="flex flex-col items-center py-2 text-center">
                  <CheckCircle className="mb-3 h-10 w-10" style={{ color: 'var(--primary)' }} />
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Account Created!</h2>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Please confirm your details before continuing.
                  </p>
                </div>

                <div className="mt-4 rounded-xl border p-4 text-left" style={{ background: 'var(--tile-bg)', borderColor: 'var(--tile-border)' }}>
                  <div className="mb-3 flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Full Name</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{registeredData?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email Address</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{registeredData?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(234,157,99,0.08)', border: '1px solid rgba(234,157,99,0.15)' }}>
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--primary)' }} />
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Make sure your email is correct. You'll need it to reset your password.</p>
                </div>

                <div className="mt-5 space-y-2">
                  <button onClick={handleConfirm} className="glass-btn w-full flex items-center justify-center gap-2 py-3">
                    <CheckCircle className="h-4 w-4" /> Confirm & Continue
                  </button>
                  <button onClick={handleGoBack} className="w-full flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-colors hover:bg-white/5" style={{ borderColor: 'var(--tile-border)', color: 'var(--text-secondary)' }}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Go Back — Email is Wrong
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
