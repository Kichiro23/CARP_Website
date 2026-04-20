import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';
import VideoBackground from '@/components/VideoBackground';
import { forgotPassword } from '@/services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);
    setResetToken('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSubmitted(true);
      // In demo mode, the token is returned. In production, it would be emailed.
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <VideoBackground opacity={0.55} />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <CarpLogo size={72} className="drop-shadow-[0_0_20px_rgba(234,157,99,0.3)]" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
                CARP
              </h1>
              <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Climate &amp; Air Research Platform
              </p>
            </div>
          </div>

          <div className="glass-strong p-6 sm:p-8">
            {!submitted ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    Reset Password
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Enter your email and we will send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="glass-input"
                        style={{ paddingLeft: 44 }}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400 break-words">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="glass-btn w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(234,157,99,0.1)' }}>
                    <KeyRound className="h-6 w-6" style={{ color: 'var(--primary)' }} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                    Check Your Email
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    If an account exists for <strong style={{ color: 'var(--text)' }}>{email}</strong>, a reset link has been sent.
                  </p>
                </div>

                {resetToken && (
                  <div className="mb-4 rounded-xl border p-3" style={{ borderColor: 'rgba(234,157,99,0.3)', background: 'rgba(234,157,99,0.05)' }}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                      Demo Mode - Your Reset Token:
                    </p>
                    <code className="block break-all rounded-lg bg-black/30 p-2 text-[11px] font-mono" style={{ color: 'var(--primary)' }}>
                      {resetToken}
                    </code>
                    <p className="mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Copy this token and use it on the reset password page. In production, this would be sent via email.
                    </p>
                    <Link
                      to={`/reset-password?token=${resetToken}`}
                      className="mt-3 block w-full rounded-xl py-2.5 text-center text-xs font-bold"
                      style={{ background: 'var(--primary)', color: '#fff' }}
                    >
                      Go to Reset Page
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => { setSubmitted(false); setEmail(''); }}
                  className="w-full py-2 text-xs font-medium transition-all hover:opacity-70"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Try a different email
                </button>
              </>
            )}

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-70"
                style={{ color: 'var(--primary)' }}
              >
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
