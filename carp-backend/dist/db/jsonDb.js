"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.persist = persist;
exports.persistSync = persistSync;
exports.resetDb = resetDb;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = process.env.DB_PATH
    ? process.env.DB_PATH.replace('.db', '.json')
    : path_1.default.join(__dirname, '../../carp.json');
// In-memory cache
let cache = null;
// Write lock to prevent concurrent file corruption
let writePending = false;
const writeQueue = [];
function acquireLock() {
    return new Promise((resolve) => {
        if (!writePending) {
            writePending = true;
            resolve();
        }
        else {
            writeQueue.push(resolve);
        }
    });
}
function releaseLock() {
    writePending = false;
    const next = writeQueue.shift();
    if (next) {
        writePending = true;
        next();
    }
}
function loadFromDisk() {
    try {
        if (fs_1.default.existsSync(DB_FILE)) {
            const content = fs_1.default.readFileSync(DB_FILE, 'utf-8');
            // Handle potential trailing data from corruption
            const trimmed = content.trim();
            const lastBrace = trimmed.lastIndexOf('}');
            if (lastBrace > 0 && lastBrace < trimmed.length - 1) {
                // File has extra data - try to parse just the first valid JSON object
                try {
                    return JSON.parse(trimmed.substring(0, lastBrace + 1));
                }
                catch {
                    // If that fails, return empty
                    console.error('DB corrupted, starting fresh');
                    return { users: [], refreshTokens: [], savedCities: [], resetTokens: [] };
                }
            }
            return JSON.parse(content);
        }
    }
    catch (err) {
        console.error('DB load error:', err);
    }
    return { users: [], refreshTokens: [], savedCities: [], resetTokens: [] };
}
// Atomic write: write to temp file, then rename
function atomicWrite(data) {
    const dir = path_1.default.dirname(DB_FILE);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    const tmpFile = DB_FILE + '.tmp';
    fs_1.default.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
    fs_1.default.renameSync(tmpFile, DB_FILE);
}
function getDb() {
    if (!cache) {
        cache = loadFromDisk();
    }
    return cache;
}
async function persist() {
    await acquireLock();
    try {
        // Reload from disk first to avoid lost updates
        const diskData = loadFromDisk();
        // Merge: keep the in-memory cache as source of truth
        // (cache is always up-to-date since we're single-process)
        atomicWrite(cache || diskData);
    }
    catch (err) {
        console.error('DB persist error:', err);
    }
    finally {
        releaseLock();
    }
}
// Synchronous persist for exit handlers
function persistSync() {
    try {
        atomicWrite(cache || { users: [], refreshTokens: [], savedCities: [], resetTokens: [] });
    }
    catch (err) {
        console.error('DB sync persist error:', err);
    }
}
function resetDb() {
    cache = { users: [], refreshTokens: [], savedCities: [], resetTokens: [] };
    persistSync();
}
// Auto-save on exit
process.on('exit', () => persistSync());
process.on('SIGINT', () => { persistSync(); process.exit(0); });
process.on('SIGTERM', () => { persistSync(); process.exit(0); });
// Initial load
cache = loadFromDisk();
