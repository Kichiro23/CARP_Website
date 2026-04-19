import { Link, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { Sun, Moon, Menu, X, LogOut, User, Settings, Shield } from 'lucide-react';
import type { Theme, User as UserType } from '@/types';
import CarpLogo from './CarpLogo';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/map', label: 'Live Map' },
  { path: '/countries', label: 'Countries' },
  { path: '/compare', label: 'Compare' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/trends', label: 'Trends' },
  { path: '/alerts', label: 'Alerts' },
  { path: '/news', label: 'News' },
  { path: '/about', label: 'About' },
];

export default function Navbar({ theme, toggleTheme, auth }: {
  theme: Theme; toggleTheme: () => void;
  auth: { user: UserType | null; logout: () => void };
}) {
  const loc = useLocation();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const isDark = theme === 'dark';

  return (
    <>
      <header
        className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 md:px-6 shrink-0"
        style={{
          height: '60px',
          minHeight: '60px',
          background: isDark ? 'rgba(10,10,18,0.88)' : 'rgba(240,242,247,0.88)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          borderBottom: '1px solid var(--tile-border)',
        }}
      >
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <button
            className="md:hidden p-2 rounded-lg transition-colors shrink-0"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <CarpLogo size={30} />
            <span className="text-base font-bold tracking-tight truncate hidden sm:inline" style={{ color: 'var(--primary)' }}>CARP</span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center min-w-0 overflow-hidden">
          {navLinks.map(l => {
            const active = loc.pathname === l.path;
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${active ? 'text-[#EA9D63]' : ''}`}
                style={{
                  color: active ? '#EA9D63' : 'var(--text-secondary)',
                  background: active ? 'rgba(234,157,99,0.10)' : 'transparent',
                }}
              >
                {l.label}
                {active && <span className="block h-0.5 mt-0.5 mx-auto rounded-full" style={{ width: '60%', background: '#EA9D63' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme + User */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all shrink-0"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setDdOpen(!ddOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all min-w-0"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #EA9D63, #d48952)' }}
              >
                {auth.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-sm font-semibold truncate max-w-[80px] lg:max-w-[120px]" style={{ color: 'var(--text)' }}>
                {auth.user?.name?.split(' ')[0] || 'User'}
              </span>
            </button>

            {ddOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border overflow-hidden shadow-2xl z-50"
                style={{
                  background: isDark ? 'rgba(18,18,28,0.96)' : 'rgba(255,255,255,0.96)',
                  backdropFilter: 'blur(24px)',
                  borderColor: 'var(--tile-border)',
                }}
              >
                <Link to="/profile" onClick={() => setDdOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#EA9D63]/10 transition-colors" style={{ color: 'var(--text)' }}>
                  <User className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Profile
                </Link>
                <Link to="/settings" onClick={() => setDdOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#EA9D63]/10 transition-colors" style={{ color: 'var(--text)' }}>
                  <Settings className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Settings
                </Link>
                <Link to="/security" onClick={() => setDdOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#EA9D63]/10 transition-colors" style={{ color: 'var(--text)' }}>
                  <Shield className="h-4 w-4" style={{ color: 'var(--primary)' }} /> Security
                </Link>
                <div className="h-px mx-4" style={{ background: 'var(--border)' }} />
                <button onClick={() => { auth.logout(); nav('/'); setDdOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-[60px] z-40 p-4 md:hidden"
          style={{
            background: isDark ? 'rgba(10,10,18,0.96)' : 'rgba(240,242,247,0.96)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-medium border-b transition-colors"
              style={{
                color: loc.pathname === l.path ? '#EA9D63' : 'var(--text-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
