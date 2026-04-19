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
        const user = (0, users_1.createUser)({
            name,
            email,
            password: hashedPassword,
            city,
            country,
        });
        const token = (0, jwt_1.generateToken)(user.id);
        const refreshToken = (0, tokens_1.createRefreshToken)(user.id);
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
        const refreshToken = (0, tokens_1.createRefreshToken)(user.id);
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
                user = (0, users_1.updateUser)(user.id, { google_id: googleId, auth_provider: 'google', avatar: picture || user.avatar }) || user;
            }
        }
        else {
            user = (0, users_1.createUser)({
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
        const refreshToken = (0, tokens_1.createRefreshToken)(user.id);
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
router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        (0, tokens_1.revokeRefreshToken)(refreshToken);
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
exports.default = router;
