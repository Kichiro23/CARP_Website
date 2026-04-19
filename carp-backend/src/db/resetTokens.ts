import { getDb, persist } from './jsonDb';
import crypto from 'crypto';

// Reset tokens expire in 1 hour
export async function createResetToken(userId: number): Promise<string> {
  const db = getDb();
  // Remove any existing tokens for this user
  db.resetTokens = db.resetTokens || [];
  db.resetTokens = db.resetTokens.filter(t => t.user_id !== userId);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  db.resetTokens.push({
    id: Date.now(),
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  });
  await persist();
  return token;
}

export function findResetToken(token: string) {
  if (!getDb().resetTokens) getDb().resetTokens = [];
  return getDb().resetTokens.find(
    t => t.token === token && new Date(t.expires_at) > new Date()
  );
}

export async function revokeResetToken(token: string): Promise<void> {
  if (!getDb().resetTokens) getDb().resetTokens = [];
  getDb().resetTokens = getDb().resetTokens.filter(t => t.token !== token);
  await persist();
}
