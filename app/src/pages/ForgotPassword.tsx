import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';
import VideoBackground from '@/components/VideoBackground';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    setSubmitted(true);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <VideoBackground opacity={0.55} />
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <CarpLogo size={72} />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>CARP</h1>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Climate & Air Research Platform</p>
            </div>
          </div>
          <div className="glass-strong p-6 sm:p-8">
            {!submitted ? (
              <>
                <div className="mb-5">
                  <Link to="/login" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </Link>
                  <h2 className="mt-2 text-xl font-bold" style={{ color: 'var(--text)' }}>Reset Password</h2>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Enter your email to receive reset instructions</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="glass-input" style={{ paddingLeft: 44 }} />
                    </div>
                  </div>
                  {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400 break-words">{error}</div>}
                  <button type="submit" className="glass-btn w-full py-3">Send Reset Link</button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle className="mb-4 h-12 w-12 text-emerald-400" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Check Your Email</h2>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  We have sent password reset instructions to <strong style={{ color: 'var(--text)' }}>{email}</strong>.<br />
                  This is a demo - no actual email was sent.
                </p>
                <Link to="/login" className="glass-btn mt-5 px-6 py-2.5 text-xs">Back to Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
