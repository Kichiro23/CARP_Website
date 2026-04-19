import fs from 'fs';
import path from 'path';

const DB_FILE = process.env.DB_PATH
  ? process.env.DB_PATH.replace('.db', '.json')
  : path.join(__dirname, '../../carp.json');

interface DbData {
  users: DbUser[];
  refreshTokens: DbRefreshToken[];
  savedCities: DbSavedCity[];
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

function load(): DbData {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('DB load error:', err);
  }
  return { users: [], refreshTokens: [], savedCities: [] };
}

function save(data: DbData): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('DB save error:', err);
  }
}

let data = load();

export function getDb(): DbData {
  return data;
}

export function persist(): void {
  save(data);
}

export function resetDb(): void {
  data = { users: [], refreshTokens: [], savedCities: [] };
  persist();
}

// Auto-save on exit
process.on('exit', () => save(data));
process.on('SIGINT', () => { save(data); process.exit(0); });
process.on('SIGTERM', () => { save(data); process.exit(0); });
