"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.findUserByGoogleId = findUserByGoogleId;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.sanitizeUser = sanitizeUser;
const jsonDb_1 = require("./jsonDb");
function findUserByEmail(email) {
    return (0, jsonDb_1.getDb)().users.find(u => u.email.toLowerCase() === email.toLowerCase());
}
function findUserById(id) {
    return (0, jsonDb_1.getDb)().users.find(u => u.id === id);
}
function findUserByGoogleId(googleId) {
    return (0, jsonDb_1.getDb)().users.find(u => u.google_id === googleId);
}
async function createUser(input) {
    const db = (0, jsonDb_1.getDb)();
    const user = {
        id: Date.now(),
        name: input.name,
        email: input.email.toLowerCase(),
        password: input.password || null,
        avatar: input.avatar || null,
        auth_provider: input.auth_provider || 'local',
        google_id: input.google_id || null,
        city: input.city || null,
        country: input.country || null,
        created_at: new Date().toISOString(),
    };
    db.users.push(user);
    await (0, jsonDb_1.persist)();
    return user;
}
async function updateUser(id, updates) {
    const db = (0, jsonDb_1.getDb)();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1)
        return undefined;
    // Only update fields that are explicitly provided (not undefined)
    const cleaned = {};
    for (const [key, val] of Object.entries(updates)) {
        if (val !== undefined) {
            cleaned[key] = val;
        }
    }
    db.users[idx] = { ...db.users[idx], ...cleaned };
    await (0, jsonDb_1.persist)();
    return db.users[idx];
}
async function deleteUser(id) {
    const db = (0, jsonDb_1.getDb)();
    const len = db.users.length;
    db.users = db.users.filter(u => u.id !== id);
    if (db.users.length < len) {
        await (0, jsonDb_1.persist)();
        return true;
    }
    return false;
}
function sanitizeUser(user) {
    const { password, ...safe } = user;
    return safe;
}
