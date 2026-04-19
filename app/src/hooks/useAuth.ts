import { useState, useCallback } from 'react';
import type { User, AuthState } from '@/types';

const USERS_KEY = 'carp_users';
const SESSION_KEY = 'carp_session';

function getUsers(): User[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}
function saveUsers(users: User[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function getSession(): User | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}
function saveSession(user: User | null) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: getSession(), isAuthenticated: !!getSession() });

  const login = useCallback((email: string, password: string): boolean => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return false;
    saveSession(user);
    setState({ user, isAuthenticated: true });
    return true;
  }, []);

  const register = useCallback((name: string, email: string, password: string): boolean => {
    const users = getUsers();
    if (users.find(u => u.email === email)) return false;
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      password,
      avatar: '',
      authProvider: 'local',
    };
    users.push(newUser);
    saveUsers(users);
    saveSession(newUser);
    setState({ user: newUser, isAuthenticated: true });
    return true;
  }, []);

  const googleLogin = useCallback((googleData: { name: string; email: string; picture: string }): boolean => {
    const users = getUsers();
    let user = users.find(u => u.email === googleData.email);
    if (!user) {
      user = {
        id: Date.now(),
        name: googleData.name,
        email: googleData.email,
        password: '__google__' + Math.random().toString(36),
        avatar: googleData.picture,
        authProvider: 'google',
      };
      users.push(user);
      saveUsers(users);
    }
    saveSession(user);
    setState({ user, isAuthenticated: true });
    return true;
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setState({ user: null, isAuthenticated: false });
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...updates };
      saveSession(updated);
      const users = getUsers();
      const idx = users.findIndex(u => u.id === updated.id);
      if (idx >= 0) { users[idx] = updated; saveUsers(users); }
      return { ...prev, user: updated };
    });
  }, []);

  return { ...state, login, register, googleLogin, logout, updateProfile };
}
