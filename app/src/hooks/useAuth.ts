import { useState, useCallback, useEffect } from 'react';
import * as api from '@/services/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

function getLocalUser(): User | null {
  try {
    const raw = localStorage.getItem('carp_session');
    if (!raw || raw === 'null') return null;
    const p = JSON.parse(raw);
    return p?.email ? p : null;
  } catch { return null; }
}

function saveLocalUser(u: User | null) {
  if (u) localStorage.setItem('carp_session', JSON.stringify(u));
  else localStorage.removeItem('carp_session');
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => ({
    user: getLocalUser(),
    isAuthenticated: !!getLocalUser(),
    loading: true,
  }));

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('carp_token');
      if (!token) {
        setState(p => ({ ...p, loading: false }));
        return;
      }
      try {
        const data = await api.getMe();
        if (data?.user) {
          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar || '',
            authProvider: data.user.authProvider,
          };
          saveLocalUser(user);
          setState({ user, isAuthenticated: true, loading: false });
        } else {
          api.logout();
          setState({ user: null, isAuthenticated: false, loading: false });
        }
      } catch {
        api.logout();
        setState({ user: null, isAuthenticated: false, loading: false });
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar || '',
      authProvider: data.user.authProvider,
    };
    saveLocalUser(user);
    setState({ user, isAuthenticated: true, loading: false });
    return data;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar || '',
      authProvider: data.user.authProvider,
    };
    saveLocalUser(user);
    setState({ user, isAuthenticated: true, loading: false });
    return data;
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const data = await api.googleAuth(credential);
    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar || '',
      authProvider: 'google',
    };
    saveLocalUser(user);
    setState({ user, isAuthenticated: true, loading: false });
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setState({ user: null, isAuthenticated: false, loading: false });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    await api.updateProfile(updates);
    setState(p => {
      if (!p.user) return p;
      const updated = { ...p.user, ...updates };
      saveLocalUser(updated);
      return { ...p, user: updated };
    });
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return api.changePassword(currentPassword, newPassword);
  }, []);

  return {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
  };
}
