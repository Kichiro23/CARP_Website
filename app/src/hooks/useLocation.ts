import { useState, useCallback, useEffect } from 'react';

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

const LOC_KEY = 'carp_locations';
const CUR_KEY = 'carp_current_location';

function loadSaved(): SavedLocation[] {
  try {
    const raw = localStorage.getItem(LOC_KEY);
    if (!raw) return [{
      id: 'default-manila',
      name: 'Manila',
      country: 'Philippines',
      lat: 14.5995,
      lng: 120.9842,
      isDefault: true,
    }];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{
      id: 'default-manila', name: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842, isDefault: true,
    }];
  } catch { return [{
    id: 'default-manila', name: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842, isDefault: true,
  }]; }
}

function loadCurrent(): SavedLocation {
  try {
    const raw = localStorage.getItem(CUR_KEY);
    if (raw) { const p = JSON.parse(raw); if (p?.lat) return p; }
  } catch {}
  const saved = loadSaved();
  return saved.find(l => l.isDefault) || saved[0];
}

function persistSaved(locations: SavedLocation[]) {
  try { localStorage.setItem(LOC_KEY, JSON.stringify(locations)); } catch {}
}

function persistCurrent(loc: SavedLocation) {
  try { localStorage.setItem(CUR_KEY, JSON.stringify(loc)); } catch {}
}

export function useLocation() {
  const [locations, setLocations] = useState<SavedLocation[]>(loadSaved);
  const [current, setCurrent] = useState<SavedLocation>(loadCurrent);

  useEffect(() => { persistSaved(locations); }, [locations]);
  useEffect(() => { persistCurrent(current); }, [current]);

  const addLocation = useCallback((loc: Omit<SavedLocation, 'id' | 'isDefault'>) => {
    const newLoc: SavedLocation = { ...loc, id: `loc-${Date.now()}`, isDefault: false };
    setLocations(prev => [...prev, newLoc]);
    return newLoc;
  }, []);

  const removeLocation = useCallback((id: string) => {
    setLocations(prev => {
      const filtered = prev.filter(l => l.id !== id);
      if (filtered.length === 0) return prev;
      const removed = prev.find(l => l.id === id);
      if (removed && current.id === id) {
        const fallback = filtered.find(l => l.isDefault) || filtered[0];
        setCurrent(fallback);
      }
      return filtered;
    });
  }, [current]);

  const setDefaultLocation = useCallback((id: string) => {
    setLocations(prev => prev.map(l => ({ ...l, isDefault: l.id === id })));
  }, []);

  const selectLocation = useCallback((loc: SavedLocation) => {
    setCurrent(loc);
  }, []);

  return {
    locations,
    current,
    addLocation,
    removeLocation,
    setDefaultLocation,
    selectLocation,
  };
}
