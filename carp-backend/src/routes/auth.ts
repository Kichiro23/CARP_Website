import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserByGoogleId, createUser, sanitizeUser, updateUser } from '../db/users';
import { createRefreshToken, revokeRefreshToken, findRefreshToken } from '../db/tokens';
import { generateToken } from '../middleware/jwt';
import { authenticateToken } from '../middleware/jwt';
import type { AuthRequest } from '../middleware/jwt';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, city, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = createUser({
      name,
      email,
      password: hashedPassword,
      city,
      country,
    });

    const token = generateToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    res.status(201).json({
      user: sanitizeUser(user),
      token,
      refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = findUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    res.json({
      user: sanitizeUser(user),
      token,
      refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture, city, country } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID and email are required' });
    }

    let user = findUserByGoogleId(googleId) || findUserByEmail(email);

    if (user) {
      if (!user.google_id) {
        user = updateUser(user.id, { google_id: googleId, auth_provider: 'google', avatar: picture || user.avatar }) || user;
      }
    } else {
      user = createUser({
        name,
        email,
        auth_provider: 'google',
        google_id: googleId,
        avatar: picture,
        city,
        country,
      });
    }

    const token = generateToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    res.json({
      user: sanitizeUser(user),
      token,
      refreshToken,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    revokeRefreshToken(refreshToken);
  }
  res.json({ message: 'Logged out' });
});

// Refresh token
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const stored = findRefreshToken(refreshToken);
    if (!stored) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const token = generateToken(stored.user_id);
    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
