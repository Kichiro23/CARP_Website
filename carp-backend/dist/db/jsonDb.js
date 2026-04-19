"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.persist = persist;
exports.resetDb = resetDb;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = process.env.DB_PATH
    ? process.env.DB_PATH.replace('.db', '.json')
    : path_1.default.join(__dirname, '../../carp.json');
function load() {
    try {
        if (fs_1.default.existsSync(DB_FILE)) {
            return JSON.parse(fs_1.default.readFileSync(DB_FILE, 'utf-8'));
        }
    }
    catch (err) {
        console.error('DB load error:', err);
    }
    return { users: [], refreshTokens: [], savedCities: [] };
}
function save(data) {
    try {
        const dir = path_1.default.dirname(DB_FILE);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        fs_1.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }
    catch (err) {
        console.error('DB save error:', err);
    }
}
let data = load();
function getDb() {
    return data;
}
function persist() {
    save(data);
}
function resetDb() {
    data = { users: [], refreshTokens: [], savedCities: [] };
    persist();
}
// Auto-save on exit
process.on('exit', () => save(data));
process.on('SIGINT', () => { save(data); process.exit(0); });
process.on('SIGTERM', () => { save(data); process.exit(0); });
