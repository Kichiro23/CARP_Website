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
  const initialUser = getLocalUser();
  const [state, setState] = useState<AuthState>({
    user: initialUser,
    isAuthenticated: !!initialUser,
    loading: true,
  });

  // Check auth status on mount
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      const token = localStorage.getItem('carp_token');
      if (!token) {
        if (mounted) setState(p => ({ ...p, loading: false }));
        return;
      }
      try {
        const data = await api.getMe();
        if (!mounted) return;
        if (data?.user) {
          const user: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar || '',
            authProvider: data.user.authProvider,
            defaultLocation: data.user.defaultLocation,
          };
          saveLocalUser(user);
          setState({ user, isAuthenticated: true, loading: false });
        } else {
          api.logout();
          setState({ user: null, isAuthenticated: false, loading: false });
        }
      } catch {
        if (!mounted) return;
        api.logout();
        setState({ user: null, isAuthenticated: false, loading: false });
      }
    };
    checkAuth();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email.trim(), password);
    if (!data?.user) throw new Error('Invalid server response');
    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar || '',
      authProvider: data.user.authProvider,
      defaultLocation: data.user.defaultLocation,
    };
    saveLocalUser(user);
    setState({ user, isAuthenticated: true, loading: false });
    return data;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.register(name.trim(), email.trim(), password);
    if (!data?.user) throw new Error('Invalid server response');
    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar || '',
      authProvider: data.user.authProvider,
      defaultLocation: data.user.defaultLocation,
    };
    saveLocalUser(user);
    setState({ user, isAuthenticated: true, loading: false });
    return data;
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const data = await api.googleAuth(credential);
    if (!data?.user) throw new Error('Invalid server response');
    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar || '',
      authProvider: 'google',
      defaultLocation: data.user.defaultLocation,
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
