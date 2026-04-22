import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import type { User } from '@/types';

interface Props {
  changePassword: (current: string, newPw: string) => Promise<void>;
  user: User | null;
}

export default function Security({ changePassword, user }: Props) {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!current || !newPw || !confirm) { setError('Please fill in all fields'); return; }
    if (newPw !== confirm) { setError('New passwords do not match'); return; }
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (user?.authProvider === 'google') { setError('Cannot change password for Google accounts'); return; }

    setLoading(true);
    try {
      await changePassword(current, newPw);
      setSuccess(true);
      setCurrent(''); setNewPw(''); setConfirm('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4">
        <Link to="/profile" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Security</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Update your password</p>
      </div>
      <div className="tile">
        <div className="mb-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Change Password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type={showCurrent ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Current password" className="glass-input" style={{ paddingLeft: 44, paddingRight: 36 }} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" className="glass-input" style={{ paddingLeft: 44, paddingRight: 36 }} />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" className="glass-input" style={{ paddingLeft: 44, paddingRight: 36 }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400">{error}</div>}
          {success && <div className="rounded-lg bg-emerald-500/10 px-4 py-2.5 text-center text-xs text-emerald-400">Password updated successfully!</div>}
          <button type="submit" disabled={loading} className="glass-btn px-6 py-2.5 text-xs">{loading ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}
