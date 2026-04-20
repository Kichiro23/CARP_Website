import { useState, useCallback } from 'react';
import type { User, AuthState } from '@/types';
import { loginUser, registerUser, googleLoginUser, logoutUser } from '@/services/api';

const SESSION_KEY = 'carp_session';
const TOKEN_KEY = 'carp_token';
const REFRESH_KEY = 'carp_refresh';
const USERS_KEY = 'carp_users';

function getSession(): User | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

function saveSession(user: User | null, token?: string, refreshToken?: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  if (!user) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}

// --- Fallback: localStorage-based auth when backend is offline ---
function getLocalUsers(): Array<{ name: string; email: string; password: string }> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveLocalUser(name: string, email: string, password: string) {
  const users = getLocalUsers();
  users.push({ name, email, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findLocalUser(email: string, password?: string) {
  const users = getLocalUsers();
  const u = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!u) return null;
  if (password && u.password !== password) return null;
  return u;
}

function makeUser(name: string, email: string): User {
  return { id: Date.now(), name, email, avatar: '', authProvider: 'local' };
}

// Check if error is a network failure (backend unreachable) vs a backend error response
function isNetworkError(err: any): boolean {
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('failed to fetch') ||
         msg.includes('network') ||
         msg.includes('connection refused') ||
         msg.includes('unreachable');
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: getSession(), isAuthenticated: !!getSession() });

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      // Try backend first
      const data = await loginUser(email, password);
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar || '',
        authProvider: data.user.auth_provider,
      };
      saveSession(user, data.token, data.refreshToken);
      setState({ user, isAuthenticated: true });
    } catch (err: any) {
      // If backend returned an actual error (401, etc.), show it
      if (!isNetworkError(err)) {
        throw err; // "Invalid email or password" from backend
      }
      // Network error: fallback to localStorage
      const localUser = findLocalUser(email, password);
      if (localUser) {
        const user = makeUser(localUser.name, localUser.email);
        saveSession(user);
        setState({ user, isAuthenticated: true });
      } else {
        throw new Error('Invalid email or password');
      }
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, _city?: string, _country?: string): Promise<void> => {
    try {
      // Try backend first
      const data = await registerUser(name, email, password, _city, _country);
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar || '',
        authProvider: data.user.auth_provider,
      };
      saveSession(user, data.token, data.refreshToken);
      setState({ user, isAuthenticated: true });
    } catch (err: any) {
      // If backend returned an actual error (409 duplicate, etc.), show it
      if (!isNetworkError(err)) {
        throw err; // "Email already registered" or validation error from backend
      }
      // Network error: fallback to localStorage
      const existing = findLocalUser(email);
      if (existing) {
        throw new Error('Email already registered');
      }
      saveLocalUser(name, email, password);
      const user = makeUser(name, email);
      saveSession(user);
      setState({ user, isAuthenticated: true });
    }
  }, []);

  const googleLogin = useCallback(async (googleData: { googleId: string; name: string; email: string; picture?: string }): Promise<void> => {
    try {
      const data = await googleLoginUser(googleData.googleId, googleData.email, googleData.name, googleData.picture);
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar || '',
        authProvider: data.user.auth_provider,
      };
      saveSession(user, data.token, data.refreshToken);
      setState({ user, isAuthenticated: true });
    } catch {
      // Fallback: create local Google user
      const user = makeUser(googleData.name, googleData.email);
      user.avatar = googleData.picture || '';
      user.authProvider = 'google';
      saveSession(user);
      setState({ user, isAuthenticated: true });
    }
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (refreshToken) {
      logoutUser(refreshToken).catch(() => {});
    }
    saveSession(null);
    setState({ user: null, isAuthenticated: false });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  const checkAuth = useCallback(async () => {
    const session = getSession();
    if (!session) {
      setState({ user: null, isAuthenticated: false });
      return;
    }
    // Backend check is optional - keep session alive
    setState({ user: session, isAuthenticated: true });
  }, []);

  return { ...state, login, register, googleLogin, logout, updateProfile, checkAuth };
}
