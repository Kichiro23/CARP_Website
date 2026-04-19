import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findUserById, updateUser, sanitizeUser, deleteUser } from '../db/users';
import { revokeAllUserTokens } from '../db/tokens';
import { authenticateToken, type AuthRequest } from '../middleware/jwt';

const router = Router();

// Get profile
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  const user = findUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: sanitizeUser(user) });
});

// Update profile
router.patch('/profile', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { name, email, city, country, avatar } = req.body;
    const user = updateUser(req.user!.id, { name, email, city, country, avatar });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = findUserById(req.user!.id);
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Cannot change password for this account' });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    updateUser(user.id, { password: hashed });
    res.json({ message: 'Password updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account
router.delete('/account', authenticateToken, (req: AuthRequest, res) => {
  try {
    revokeAllUserTokens(req.user!.id);
    deleteUser(req.user!.id);
    res.json({ message: 'Account deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
