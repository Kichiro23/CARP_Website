import { useState, useCallback } from 'react';
import type { User, AuthState } from '@/types';

const SK = 'carp_session';
const UK = 'carp_users';

function getSession(): User | null {
  try { const r = localStorage.getItem(SK); if (!r || r === 'null') return null; const p = JSON.parse(r); return p?.email ? p : null; } catch { return null; }
}
function saveSession(u: User | null) { if (u) localStorage.setItem(SK, JSON.stringify(u)); else localStorage.removeItem(SK); }
function getLocalUsers(): any[] { try { const r = localStorage.getItem(UK); if (!r) return []; const p = JSON.parse(r); return Array.isArray(p) ? p : []; } catch { return []; } }
function saveLocalUser(n: string, e: string, p: string) { const u = getLocalUsers(); u.push({ name: n, email: e.toLowerCase(), password: p }); localStorage.setItem(UK, JSON.stringify(u)); }
function findLocalUser(e: string, pw?: string) { const u = getLocalUsers(); const f = u.find((x: any) => x.email === e.toLowerCase()); if (!f) return null; if (pw && f.password !== pw) return null; return f; }
function makeUser(n: string, e: string): User { return { id: Date.now(), name: n, email: e, avatar: '', authProvider: 'local' }; }

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => ({ user: getSession(), isAuthenticated: !!getSession() }));

  const login = useCallback(async (email: string, password: string) => {
    const u = findLocalUser(email, password);
    if (!u) throw new Error('Invalid email or password');
    const user = makeUser(u.name, u.email);
    saveSession(user); setState({ user, isAuthenticated: true });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (findLocalUser(email)) throw new Error('Email already registered');
    saveLocalUser(name, email, password);
    const user = makeUser(name, email);
    saveSession(user); setState({ user, isAuthenticated: true });
  }, []);

  const googleLogin = useCallback(async (d: { googleId: string; name: string; email: string; picture?: string }) => {
    const user = makeUser(d.name, d.email);
    user.avatar = d.picture || ''; user.authProvider = 'google';
    saveSession(user); setState({ user, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => { saveSession(null); setState({ user: null, isAuthenticated: false }); }, []);
  const updateProfile = useCallback((u: Partial<User>) => { setState(p => { if (!p.user) return p; const up = { ...p.user, ...u }; saveSession(up); return { ...p, user: up }; }); }, []);
  const checkAuth = useCallback(() => { const u = getSession(); setState({ user: u, isAuthenticated: !!u }); }, []);

  return { ...state, login, register, googleLogin, logout, updateProfile, checkAuth };
}
