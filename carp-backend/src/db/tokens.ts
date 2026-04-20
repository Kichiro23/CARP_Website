import { getDb, persist } from './jsonDb';
import crypto from 'crypto';

export async function createRefreshToken(userId: number): Promise<string> {
  const db = getDb();
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  db.refreshTokens.push({
    id: Date.now(),
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  });
  await persist();
  return token;
}

export function findRefreshToken(token: string) {
  return getDb().refreshTokens.find(
    t => t.token === token && new Date(t.expires_at) > new Date()
  );
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const db = getDb();
  db.refreshTokens = db.refreshTokens.filter(t => t.token !== token);
  await persist();
}

export async function revokeAllUserTokens(userId: number): Promise<void> {
  const db = getDb();
  db.refreshTokens = db.refreshTokens.filter(t => t.user_id !== userId);
  await persist();
}
