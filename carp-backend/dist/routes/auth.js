"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const users_1 = require("../db/users");
const tokens_1 = require("../db/tokens");
const resetTokens_1 = require("../db/resetTokens");
const jwt_1 = require("../middleware/jwt");
const jwt_2 = require("../middleware/jwt");
const router = (0, express_1.Router)();
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
        const existing = (0, users_1.findUserByEmail)(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await (0, users_1.createUser)({
            name,
            email,
            password: hashedPassword,
            city,
            country,
        });
        const token = (0, jwt_1.generateToken)(user.id);
        const refreshToken = await (0, tokens_1.createRefreshToken)(user.id);
        res.status(201).json({
            user: (0, users_1.sanitizeUser)(user),
            token,
            refreshToken,
        });
    }
    catch (err) {
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
        const user = (0, users_1.findUserByEmail)(email);
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = (0, jwt_1.generateToken)(user.id);
        const refreshToken = await (0, tokens_1.createRefreshToken)(user.id);
        res.json({
            user: (0, users_1.sanitizeUser)(user),
            token,
            refreshToken,
        });
    }
    catch (err) {
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
        let user = (0, users_1.findUserByGoogleId)(googleId) || (0, users_1.findUserByEmail)(email);
        if (user) {
            if (!user.google_id) {
                user = await (0, users_1.updateUser)(user.id, { google_id: googleId, auth_provider: 'google', avatar: picture || user.avatar }) || user;
            }
        }
        else {
            user = await (0, users_1.createUser)({
                name,
                email,
                auth_provider: 'google',
                google_id: googleId,
                avatar: picture,
                city,
                country,
            });
        }
        const token = (0, jwt_1.generateToken)(user.id);
        const refreshToken = await (0, tokens_1.createRefreshToken)(user.id);
        res.json({
            user: (0, users_1.sanitizeUser)(user),
            token,
            refreshToken,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get current user
router.get('/me', jwt_2.authenticateToken, (req, res) => {
    res.json({ user: req.user });
});
// Logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        await (0, tokens_1.revokeRefreshToken)(refreshToken);
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
        const stored = (0, tokens_1.findRefreshToken)(refreshToken);
        if (!stored) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }
        const token = (0, jwt_1.generateToken)(stored.user_id);
        res.json({ token });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Forgot password - generates a reset token
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const user = (0, users_1.findUserByEmail)(email);
        if (!user) {
            // Return success even if email not found (security: don't reveal registered emails)
            return res.json({ message: 'If an account exists, a reset link has been sent.' });
        }
        if (!user.password) {
            return res.status(400).json({ error: 'This account uses Google sign-in. Please sign in with Google.' });
        }
        const resetToken = await (0, resetTokens_1.createResetToken)(user.id);
        // In production, send this token via email (SMTP)
        // For demo: return token in response so user can copy-paste it
        res.json({
            message: 'Password reset token generated. Check your email (or use the token below for demo).',
            resetToken, // REMOVE THIS IN PRODUCTION - only for demo/testing
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Reset password using token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const stored = (0, resetTokens_1.findResetToken)(token);
        if (!stored) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await (0, users_1.updateUser)(stored.user_id, { password: hashedPassword });
        await (0, resetTokens_1.revokeResetToken)(token);
        res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Verify reset token (optional - for frontend validation)
router.get('/verify-reset-token', (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        const stored = (0, resetTokens_1.findResetToken)(token);
        if (!stored) {
            return res.status(400).json({ valid: false, error: 'Invalid or expired token' });
        }
        res.json({ valid: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
