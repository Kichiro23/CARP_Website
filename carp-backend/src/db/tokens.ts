import { getDb, persist } from './jsonDb';
import crypto from 'crypto';

export function createRefreshToken(userId: number): string {
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
  persist();
  return token;
}

export function findRefreshToken(token: string) {
  return getDb().refreshTokens.find(
    t => t.token === token && new Date(t.expires_at) > new Date()
  );
}

export function revokeRefreshToken(token: string): void {
  const db = getDb();
  db.refreshTokens = db.refreshTokens.filter(t => t.token !== token);
  persist();
}

export function revokeAllUserTokens(userId: number): void {
  const db = getDb();
  db.refreshTokens = db.refreshTokens.filter(t => t.user_id !== userId);
  persist();
}
