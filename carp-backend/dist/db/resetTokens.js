"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResetToken = createResetToken;
exports.findResetToken = findResetToken;
exports.revokeResetToken = revokeResetToken;
const jsonDb_1 = require("./jsonDb");
const crypto_1 = __importDefault(require("crypto"));
// Reset tokens expire in 1 hour
async function createResetToken(userId) {
    const db = (0, jsonDb_1.getDb)();
    // Remove any existing tokens for this user
    db.resetTokens = db.resetTokens || [];
    db.resetTokens = db.resetTokens.filter(t => t.user_id !== userId);
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    db.resetTokens.push({
        id: Date.now(),
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
    });
    await (0, jsonDb_1.persist)();
    return token;
}
function findResetToken(token) {
    if (!(0, jsonDb_1.getDb)().resetTokens)
        (0, jsonDb_1.getDb)().resetTokens = [];
    return (0, jsonDb_1.getDb)().resetTokens.find(t => t.token === token && new Date(t.expires_at) > new Date());
}
async function revokeResetToken(token) {
    if (!(0, jsonDb_1.getDb)().resetTokens)
        (0, jsonDb_1.getDb)().resetTokens = [];
    (0, jsonDb_1.getDb)().resetTokens = (0, jsonDb_1.getDb)().resetTokens.filter(t => t.token !== token);
    await (0, jsonDb_1.persist)();
}
