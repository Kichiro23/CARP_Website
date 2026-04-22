import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Camera, Save, MapPin, Star, Trash2, Check, Shield } from 'lucide-react';
import CitySearch from '@/components/CitySearch';
import type { User as UType } from '@/types';
import type { SavedLocation } from '@/hooks/useLocation';

interface Props {
  user: UType | null;
  updateProfile: (u: Partial<UType>) => void;
  locations: SavedLocation[];
  addLocation: (loc: Omit<SavedLocation, 'id' | 'isDefault'>) => void;
  removeLocation: (id: string) => void;
  setDefaultLocation: (id: string) => void;
}

function compressImage(file: File, maxWidth = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Profile({ user, updateProfile, locations, addLocation, removeLocation, setDefaultLocation }: Props) {
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(user?.avatar || null);
  }, [user?.avatar]);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setUploadError('Only JPG and PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB.');
      return;
    }
    try {
      const compressed = await compressImage(file, 400);
      setPreviewUrl(compressed);
      updateProfile({ avatar: compressed });
    } catch {
      setUploadError('Failed to process image.');
    }
  }, [updateProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAddLocation = (city: { name: string; country: string; lat: number; lng: number }) => {
    const exists = locations.some(l => l.name === city.name && l.country === city.country);
    if (exists) return;
    addLocation({ name: city.name, country: city.country, lat: city.lat, lng: city.lng });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Profile</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Manage your account and locations</p>
      </div>

      <div className="tile">
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-20 w-20 rounded-full object-cover" style={{ border: '2px solid var(--primary)' }} />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors group-hover:scale-110" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg)' }}>
              <Camera className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageSelect} className="hidden" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{user?.name || 'User'}</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <p className="mt-1 text-[10px] font-medium" style={{ color: 'var(--primary)' }}>{user?.authProvider === 'google' ? 'Google Account' : 'Local Account'}</p>
          </div>
        </div>
        {uploadError && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-center text-xs text-red-400">{uploadError}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="glass-input" style={{ paddingLeft: 44 }} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="email" value={user?.email || ''} disabled className="glass-input opacity-50 cursor-not-allowed" style={{ paddingLeft: 44 }} />
            </div>
            <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
          </div>
          {saved && <div className="rounded-lg bg-emerald-500/10 px-4 py-2.5 text-center text-xs text-emerald-400">Profile updated!</div>}
          <div className="flex items-center gap-3">
            <button type="submit" className="glass-btn flex items-center gap-2 px-5 py-2.5 text-xs">
              <Save className="h-3.5 w-3.5" /> Save Changes
            </button>
            <Link to="/security" className="flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-semibold hover:bg-white/5" style={{ borderColor: 'var(--tile-border)', color: 'var(--text-secondary)' }}>
              <Shield className="h-3.5 w-3.5" /> Security
            </Link>
          </div>
        </form>
      </div>

      <div className="tile">
        <h3 className="tile-title mb-3">Saved Locations</h3>
        <div className="mb-4">
          <CitySearch onSelect={handleAddLocation} placeholder="Add a city..." />
        </div>
        <div className="space-y-2">
          {locations.map(loc => (
            <div key={loc.id} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: 'var(--tile-border)', background: 'rgba(255,255,255,0.02)' }}>
              <MapPin className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{loc.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{loc.country} &middot; {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}</p>
              </div>
              {loc.isDefault ? (
                <span className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold" style={{ background: 'rgba(234,157,99,0.15)', color: 'var(--primary)' }}>
                  <Star className="h-3 w-3" /> Default
                </span>
              ) : (
                <button onClick={() => setDefaultLocation(loc.id)} className="rounded-md px-2 py-1 text-[10px] font-semibold hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <Check className="h-3 w-3 inline mr-0.5" /> Set Default
                </button>
              )}
              {!loc.isDefault && (
                <button onClick={() => removeLocation(loc.id)} className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10 transition-colors" title="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {locations.length === 0 && (
            <p className="py-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No saved locations. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
