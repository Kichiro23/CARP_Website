"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = require("../db/users");
const JWT_SECRET = process.env.JWT_SECRET || 'carp-super-secret-key-change-in-production';
const JWT_EXPIRES = '24h';
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
function generateRefreshToken(userId) {
    return jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
}
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
function authenticateToken(req, res, next) {
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
    const user = (0, users_1.findUserById)(decoded.userId);
    if (!user) {
        res.status(403).json({ error: 'User not found' });
        return;
    }
    req.user = (0, users_1.sanitizeUser)(user);
    next();
}
