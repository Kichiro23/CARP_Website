import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import type { User as UType } from '@/types';

const links = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/map', label: 'Live Map' },
  { path: '/countries', label: 'Countries' },
  { path: '/compare', label: 'Compare' },
  { path: '/air-quality', label: 'Air Quality' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/trends', label: 'Trends' },
  { path: '/alerts', label: 'Alerts' },
  { path: '/news', label: 'News' },
  { path: '/about', label: 'About' },
];

export default function Navbar({ auth }: { auth: { user: UType | null; logout: () => void } }) {
  const loc = useLocation();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 md:px-6" style={{ height: 60, background: 'rgba(19,19,31,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--tile-border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <button className="md:hidden p-2" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <img src="./logo.png" alt="CARP" className="h-8 w-8 object-contain" />
            <span className="text-base font-bold truncate" style={{ color: 'var(--primary)' }}>CARP</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center min-w-0 overflow-hidden">
          {links.map(l => {
            const active = loc.pathname === l.path;
            return (
              <Link key={l.path} to={l.path} className="px-3 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all"
                style={{ color: active ? '#EA9D63' : 'var(--text-secondary)', background: active ? 'rgba(234,157,99,0.10)' : 'transparent' }}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="relative">
            <button onClick={() => setDdOpen(!ddOpen)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl min-w-0">
              {auth.user?.avatar ? (
                <img src={auth.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" style={{ border: '1.5px solid var(--primary)' }} />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}>
                  {auth.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="hidden sm:inline text-sm font-semibold truncate max-w-[80px]" style={{ color: 'var(--text)' }}>{auth.user?.name?.split(' ')[0] || 'User'}</span>
            </button>
            {ddOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border overflow-hidden shadow-2xl z-50" style={{ background: 'rgba(26,26,46,0.96)', backdropFilter: 'blur(24px)', borderColor: 'var(--tile-border)' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--tile-border)' }}>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{auth.user?.name}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{auth.user?.email}</p>
                </div>
                <Link to="/profile" onClick={() => setDdOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#EA9D63]/10" style={{ color: 'var(--text)' }}><User className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} /> <span>Profile</span></Link>
                <button onClick={() => { auth.logout(); nav('/'); setDdOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"><LogOut className="h-4 w-4 shrink-0" /> <span>Logout</span></button>
              </div>
            )}
          </div>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 top-[60px] z-40 p-4 md:hidden" style={{ background: 'rgba(19,19,31,0.96)', backdropFilter: 'blur(24px)' }}>
          {links.map(l => (
            <Link key={l.path} to={l.path} onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium border-b" style={{ color: loc.pathname === l.path ? '#EA9D63' : 'var(--text-secondary)', borderColor: 'var(--border)' }}>{l.label}</Link>
          ))}
        </div>
      )}
    </>
  );
}
