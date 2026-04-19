import { useState, useCallback } from 'react';
import type { User, AuthState } from '@/types';
import { loginUser, registerUser, googleLoginUser, logoutUser, getCurrentUser } from '@/services/api';

const SESSION_KEY = 'carp_session';
const TOKEN_KEY = 'carp_token';
const REFRESH_KEY = 'carp_refresh';

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

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: getSession(), isAuthenticated: !!getSession() });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
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
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, city?: string, country?: string): Promise<boolean> => {
    try {
      const data = await registerUser(name, email, password, city, country);
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar || '',
        authProvider: data.user.auth_provider,
      };
      saveSession(user, data.token, data.refreshToken);
      setState({ user, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  }, []);

  const googleLogin = useCallback(async (googleData: { googleId: string; name: string; email: string; picture?: string }): Promise<boolean> => {
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
      return true;
    } catch {
      return false;
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
    try {
      // Optimistic update
      setState(prev => {
        if (!prev.user) return prev;
        const updated = { ...prev.user, ...updates };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        return { ...prev, user: updated };
      });
      // Could also sync with backend here
    } catch {
      // Rollback handled by state
    }
  }, []);

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const data = await getCurrentUser();
      if (data.user) {
        const user: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar || '',
          authProvider: data.user.auth_provider,
        };
        saveSession(user);
        setState({ user, isAuthenticated: true });
      }
    } catch {
      saveSession(null);
      setState({ user: null, isAuthenticated: false });
    }
  }, []);

  return { ...state, login, register, googleLogin, logout, updateProfile, checkAuth };
}
