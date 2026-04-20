// CARP Backend API Service
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
function getToken(): string | null {
  return localStorage.getItem('carp_token');
}

// Generic fetch with auth header
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

// ============================================
// AUTH API
// ============================================

export async function register(name: string, email: string, password: string) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) localStorage.setItem('carp_token', data.token);
  return data;
}

export async function googleAuth(token: string) {
  const data = await apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  if (data.token) localStorage.setItem('carp_token', data.token);
  return data;
}

export async function forgotPassword(email: string) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  const data = await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
  if (data.token) localStorage.setItem('carp_token', data.token);
  return data;
}

export async function getMe() {
  return apiFetch('/auth/me', { method: 'GET' });
}

export function logout() {
  localStorage.removeItem('carp_token');
  localStorage.removeItem('carp_session');
}

// ============================================
// PROFILE API
// ============================================

export async function updateProfile(updates: { name?: string; avatar?: string }) {
  return apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function uploadAvatar(imageBase64: string) {
  return apiFetch('/profile/avatar', {
    method: 'POST',
    body: JSON.stringify({ image: imageBase64 }),
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch('/profile/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function updateDefaultLocation(location: { name: string; country: string; lat: number; lng: number }) {
  return apiFetch('/profile/default-location', {
    method: 'PUT',
    body: JSON.stringify(location),
  });
}

// ============================================
// LOCATIONS API
// ============================================

export async function getLocations() {
  return apiFetch('/locations', { method: 'GET' });
}

export async function addLocation(location: { name: string; country: string; lat: number; lng: number }) {
  return apiFetch('/locations', {
    method: 'POST',
    body: JSON.stringify(location),
  });
}

export async function deleteLocation(id: string) {
  return apiFetch(`/locations/${id}`, { method: 'DELETE' });
}

export async function setDefaultLocation(id: string) {
  return apiFetch(`/locations/${id}/default`, { method: 'PUT' });
}
