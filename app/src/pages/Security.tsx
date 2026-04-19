import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Security() {
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!currentPw || !newPw || !confirmPw) { setError('Fill in all fields'); return; }
    if (currentPw !== user?.password) { setError('Current password incorrect'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }
    if (newPw.length < 6) { setError('Min 6 characters'); return; }
    const users = JSON.parse(localStorage.getItem('carp_users') || '[]');
    const idx = users.findIndex((u: any) => u.id === user?.id);
    if (idx >= 0) { users[idx].password = newPw; localStorage.setItem('carp_users', JSON.stringify(users)); }
    const session = JSON.parse(localStorage.getItem('carp_session') || 'null');
    if (session) { session.password = newPw; localStorage.setItem('carp_session', JSON.stringify(session)); }
    setSuccess('Password updated'); setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Security</h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Manage account security</p>
      </div>

      <div className="tile">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <Shield className="h-7 w-7 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-emerald-400">Account Secured</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Auth: <span className="font-semibold" style={{ color: 'var(--primary)' }}>{user?.authProvider === 'google' ? 'Google OAuth' : 'Email & Password'}</span></p>
          </div>
        </div>
      </div>

      <div className="tile">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="h-4 w-4" style={{ color: 'var(--primary)' }} />
          <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Change Password</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Password</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Current password" className="glass-input pr-10" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" className="glass-input pr-10" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm password" className="glass-input" />
          </div>
          {error && <div className="rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400">{error}</div>}
          {success && <div className="rounded-lg bg-emerald-500/10 px-4 py-2.5 text-center text-xs text-emerald-400">{success}</div>}
          <button type="submit" className="glass-btn w-full flex items-center justify-center gap-2 py-3 text-sm"><Lock className="h-4 w-4" /> Update Password</button>
        </form>
      </div>

      <div className="tile">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Session Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--tile-border)' }}><span style={{ color: 'var(--text-muted)' }}>User ID</span><span className="font-mono text-xs" style={{ color: 'var(--text)' }}>{user?.id || 'N/A'}</span></div>
          <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--tile-border)' }}><span style={{ color: 'var(--text-muted)' }}>Email</span><span className="text-xs truncate" style={{ color: 'var(--text)' }}>{user?.email || 'N/A'}</span></div>
          <div className="flex justify-between py-2"><span style={{ color: 'var(--text-muted)' }}>Auth</span><span className="glass-badge text-[10px]" style={{ color: 'var(--primary)' }}>{user?.authProvider === 'google' ? 'Google OAuth' : 'Local'}</span></div>
        </div>
      </div>
    </div>
  );
}
