import fs from 'fs';
import path from 'path';

const DB_FILE = process.env.DB_PATH
  ? process.env.DB_PATH.replace('.db', '.json')
  : path.join(__dirname, '../../carp.json');

interface DbData {
  users: DbUser[];
  refreshTokens: DbRefreshToken[];
  savedCities: DbSavedCity[];
  resetTokens: DbResetToken[];
}

export interface DbResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface DbUser {
  id: number;
  name: string;
  email: string;
  password: string | null;
  avatar: string | null;
  auth_provider: 'local' | 'google';
  google_id: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
}

export interface DbRefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface DbSavedCity {
  id: number;
  user_id: number;
  city_name: string;
  country: string | null;
  lat: number | null;
  lon: number | null;
  created_at: string;
}

// In-memory cache
let cache: DbData | null = null;

// Write lock to prevent concurrent file corruption
let writePending = false;
const writeQueue: (() => void)[] = [];

function acquireLock(): Promise<void> {
  return new Promise((resolve) => {
    if (!writePending) {
      writePending = true;
      resolve();
    } else {
      writeQueue.push(resolve);
    }
  });
}

function releaseLock(): void {
  writePending = false;
  const next = writeQueue.shift();
  if (next) {
    writePending = true;
    next();
  }
}

function loadFromDisk(): DbData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      // Handle potential trailing data from corruption
      const trimmed = content.trim();
      const lastBrace = trimmed.lastIndexOf('}');
      if (lastBrace > 0 && lastBrace < trimmed.length - 1) {
        // File has extra data - try to parse just the first valid JSON object
        try {
          return JSON.parse(trimmed.substring(0, lastBrace + 1));
        } catch {
          // If that fails, return empty
          console.error('DB corrupted, starting fresh');
          return { users: [], refreshTokens: [], savedCities: [], resetTokens: [] };
        }
      }
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('DB load error:', err);
  }
  return { users: [], refreshTokens: [], savedCities: [], resetTokens: [] };
}

// Atomic write: write to temp file, then rename
function atomicWrite(data: DbData): void {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmpFile = DB_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, DB_FILE);
}

export function getDb(): DbData {
  if (!cache) {
    cache = loadFromDisk();
  }
  return cache;
}

export async function persist(): Promise<void> {
  await acquireLock();
  try {
    // Reload from disk first to avoid lost updates
    const diskData = loadFromDisk();
    // Merge: keep the in-memory cache as source of truth
    // (cache is always up-to-date since we're single-process)
    atomicWrite(cache || diskData);
  } catch (err) {
    console.error('DB persist error:', err);
  } finally {
    releaseLock();
  }
}

// Synchronous persist for exit handlers
export function persistSync(): void {
  try {
    atomicWrite(cache || { users: [], refreshTokens: [], savedCities: [], resetTokens: [] });
  } catch (err) {
    console.error('DB sync persist error:', err);
  }
}

export function resetDb(): void {
  cache = { users: [], refreshTokens: [], savedCities: [], resetTokens: [] };
  persistSync();
}

// Auto-save on exit
process.on('exit', () => persistSync());
process.on('SIGINT', () => { persistSync(); process.exit(0); });
process.on('SIGTERM', () => { persistSync(); process.exit(0); });

// Initial load
cache = loadFromDisk();
