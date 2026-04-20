"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users_1 = require("../db/users");
const tokens_1 = require("../db/tokens");
const jwt_1 = require("../middleware/jwt");
const router = (0, express_1.Router)();
// Get profile
router.get('/profile', jwt_1.authenticateToken, (req, res) => {
    const user = (0, users_1.findUserById)(req.user.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json({ user: (0, users_1.sanitizeUser)(user) });
});
// Update profile
router.patch('/profile', jwt_1.authenticateToken, async (req, res) => {
    try {
        const { name, email, city, country, avatar } = req.body;
        const user = await (0, users_1.updateUser)(req.user.id, { name, email, city, country, avatar });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ user: (0, users_1.sanitizeUser)(user) });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Change password
router.post('/change-password', jwt_1.authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = (0, users_1.findUserById)(req.user.id);
        if (!user || !user.password) {
            return res.status(400).json({ error: 'Cannot change password for this account' });
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!valid)
            return res.status(401).json({ error: 'Current password is incorrect' });
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }
        const hashed = await bcryptjs_1.default.hash(newPassword, 12);
        await (0, users_1.updateUser)(user.id, { password: hashed });
        res.json({ message: 'Password updated' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Delete account
router.delete('/account', jwt_1.authenticateToken, async (req, res) => {
    try {
        await (0, tokens_1.revokeAllUserTokens)(req.user.id);
        await (0, users_1.deleteUser)(req.user.id);
        res.json({ message: 'Account deleted' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
