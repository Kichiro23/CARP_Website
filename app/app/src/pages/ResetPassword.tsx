import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import CarpLogo from '@/components/CarpLogo';
import Footer from '@/components/Footer';
import VideoBackground from '@/components/VideoBackground';
import { resetPassword } from '@/services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is required');
      return;
    }
    if (!password || !confirm) {
      setError('Please fill in both password fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSubmitted(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
            {/* Back button */}
            <div className="mb-4">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Forgot Password
              </Link>
            </div>
            {!submitted ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    New Password
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Enter your reset token and create a new password
                  </p>
                </div>

                {!tokenFromUrl && (
                  <div className="mb-4 rounded-lg border p-3 flex items-start gap-2" style={{ borderColor: 'rgba(234,157,99,0.3)', background: 'rgba(234,157,99,0.05)' }}>
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      No token in URL. Paste your reset token from the email below.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Reset Token */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Reset Token
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your reset token here"
                      className="glass-input font-mono text-xs"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="glass-input"
                        style={{ paddingLeft: 44, paddingRight: 36 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Confirm Password
                    </label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your new password"
                      className="glass-input"
                    />
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
                    {loading ? 'Resetting...' : 'Reset Password'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                </div>
                <h2 className="mb-1 text-lg font-bold" style={{ color: 'var(--text)' }}>
                  Password Reset!
                </h2>
                <p className="mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Your password has been reset successfully. You will be redirected to the login page.
                </p>
                <Link
                  to="/login"
                  className="glass-btn inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
                >
                  Go to Sign In <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-xs font-medium transition-all hover:opacity-70"
                style={{ color: 'var(--primary)' }}
              >
                Request a new token
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
