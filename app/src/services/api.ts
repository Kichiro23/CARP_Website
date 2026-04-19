// API client for the CARP backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function api(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const token = localStorage.getItem('carp_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export async function registerUser(name: string, email: string, password: string, city?: string, country?: string) {
  return api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, city, country }),
  });
}

export async function loginUser(email: string, password: string) {
  return api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function googleLoginUser(googleId: string, email: string, name: string, picture?: string) {
  return api('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ googleId, email, name, picture }),
  });
}

export async function logoutUser(refreshToken: string) {
  return api('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getCurrentUser() {
  return api('/api/auth/me');
}

// User
export async function getProfile() {
  return api('/api/user/profile');
}

export async function updateProfile(updates: Record<string, string>) {
  return api('/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return api('/api/user/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export { API_URL };
