import { getDb, persist } from './jsonDb';
import type { DbUser } from './jsonDb';

export type { DbUser as User };

export function findUserByEmail(email: string): DbUser | undefined {
  return getDb().users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: number): DbUser | undefined {
  return getDb().users.find(u => u.id === id);
}

export function findUserByGoogleId(googleId: string): DbUser | undefined {
  return getDb().users.find(u => u.google_id === googleId);
}

export async function createUser(input: {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  auth_provider?: 'local' | 'google';
  google_id?: string;
  city?: string;
  country?: string;
}): Promise<DbUser> {
  const db = getDb();
  const user: DbUser = {
    id: Date.now(),
    name: input.name,
    email: input.email.toLowerCase(),
    password: input.password || null,
    avatar: input.avatar || null,
    auth_provider: input.auth_provider || 'local',
    google_id: input.google_id || null,
    city: input.city || null,
    country: input.country || null,
    created_at: new Date().toISOString(),
  };
  db.users.push(user);
  await persist();
  return user;
}

export async function updateUser(id: number, updates: Partial<Omit<DbUser, 'id' | 'created_at'>>): Promise<DbUser | undefined> {
  const db = getDb();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return undefined;
  // Only update fields that are explicitly provided (not undefined)
  const cleaned: Partial<DbUser> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined) {
      (cleaned as any)[key] = val;
    }
  }
  db.users[idx] = { ...db.users[idx], ...cleaned };
  await persist();
  return db.users[idx];
}

export async function deleteUser(id: number): Promise<boolean> {
  const db = getDb();
  const len = db.users.length;
  db.users = db.users.filter(u => u.id !== id);
  if (db.users.length < len) {
    await persist();
    return true;
  }
  return false;
}

export function sanitizeUser(user: DbUser) {
  const { password, ...safe } = user;
  return safe;
}
