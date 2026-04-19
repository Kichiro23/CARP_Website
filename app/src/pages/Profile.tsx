import { useState } from 'react';
import { User, MapPin, Mail, Save, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState(user?.location || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ name, email, location });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Profile</h1>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Manage your account information</p>
      </div>

      <div className="tile text-center">
        <div className="relative mx-auto mb-3 inline-block">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--tile-border)' }}>
            <Camera className="h-3 w-3" style={{ color: 'var(--primary)' }} />
          </button>
        </div>
        <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>{user?.name || 'User'}</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
      </div>

      <div className="tile space-y-4">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}><User className="h-3 w-3" style={{ color: 'var(--primary)' }} /> Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="glass-input" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}><Mail className="h-3 w-3" style={{ color: 'var(--primary)' }} /> Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="glass-input" />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}><MapPin className="h-3 w-3" style={{ color: 'var(--primary)' }} /> Location</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" className="glass-input" />
        </div>

        {saved && <div className="rounded-lg bg-emerald-500/10 px-4 py-2.5 text-center text-xs text-emerald-400">Profile updated successfully</div>}

        <button onClick={handleSave} className="glass-btn w-full flex items-center justify-center gap-2 py-3 text-sm">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}
