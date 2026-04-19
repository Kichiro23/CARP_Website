"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = createRefreshToken;
exports.findRefreshToken = findRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllUserTokens = revokeAllUserTokens;
const jsonDb_1 = require("./jsonDb");
const crypto_1 = __importDefault(require("crypto"));
async function createRefreshToken(userId) {
    const db = (0, jsonDb_1.getDb)();
    const token = crypto_1.default.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    db.refreshTokens.push({
        id: Date.now(),
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
    });
    await (0, jsonDb_1.persist)();
    return token;
}
function findRefreshToken(token) {
    return (0, jsonDb_1.getDb)().refreshTokens.find(t => t.token === token && new Date(t.expires_at) > new Date());
}
async function revokeRefreshToken(token) {
    const db = (0, jsonDb_1.getDb)();
    db.refreshTokens = db.refreshTokens.filter(t => t.token !== token);
    await (0, jsonDb_1.persist)();
}
async function revokeAllUserTokens(userId) {
    const db = (0, jsonDb_1.getDb)();
    db.refreshTokens = db.refreshTokens.filter(t => t.user_id !== userId);
    await (0, jsonDb_1.persist)();
}
