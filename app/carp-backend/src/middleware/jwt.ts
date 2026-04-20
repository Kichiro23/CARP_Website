import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { findUserById, sanitizeUser } from '../db/users';

const JWT_SECRET = process.env.JWT_SECRET || 'carp-super-secret-key-change-in-production';
const JWT_EXPIRES = '24h';

export interface AuthRequest extends Request {
  user?: { id: number; name: string; email: string };
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch {
    return null;
  }
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  const user = findUserById(decoded.userId);
  if (!user) {
    res.status(403).json({ error: 'User not found' });
    return;
  }

  req.user = sanitizeUser(user);
  next();
}
