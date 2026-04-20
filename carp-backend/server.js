const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://weathercarp.com";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));

const users = [];
const locations = [];
const resetTokens = new Map();

const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "No token" });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }
    if (users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = { id: Date.now().toString(), name, email: email.toLowerCase(), password: hash, avatar: "", authProvider: "local", defaultLocation: { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842 } };
    users.push(user);
    const token = generateToken(user.id);
    res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider, defaultLocation: user.defaultLocation } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(user.id);
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider, defaultLocation: user.defaultLocation } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) return res.status(400).json({ success: false, message: "Token required" });
    let user = users.find(u => u.email === "google@example.com");
    if (!user) {
      user = { id: Date.now().toString(), name: "Google User", email: "google@example.com", password: "", avatar: "", authProvider: "google", googleId: "123", defaultLocation: { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842 } };
      users.push(user);
    }
    const jwtToken = generateToken(user.id);
    res.json({ success: true, token: jwtToken, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Google auth failed" });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) return res.json({ success: true, message: "If account exists, email sent" });
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    resetTokens.set(email.toLowerCase(), { token: resetToken, expires: Date.now() + 30 * 60 * 1000 });
    console.log("Password reset for " + email + ": https://weathercarp.com/reset-password?token=" + resetToken);
    res.json({ success: true, message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    let found = null;
    for (const [email, data] of resetTokens) {
      if (data.token === token && data.expires > Date.now()) {
        found = email;
        break;
      }
    }
    if (!found) return res.status(400).json({ success: false, message: "Invalid or expired token" });
    const user = users.find(u => u.email === found);
    if (user) {
      user.password = await bcrypt.hash(password, 12);
      resetTokens.delete(found);
    }
    const jwtToken = generateToken(user.id);
    res.json({ success: true, token: jwtToken, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/auth/me", auth, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider, defaultLocation: user.defaultLocation } });
});

app.get("/api/profile", auth, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider, defaultLocation: user.defaultLocation } });
});

app.put("/api/profile", auth, async (req, res) => {
  const user = users.find(u => u.id === req.userId);
  const { name, avatar } = req.body;
  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
});

app.put("/api/profile/password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.find(u => u.id === req.userId);
  if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ success: false, message: "Current password incorrect" });
  }
  user.password = await bcrypt.hash(newPassword, 12);
  res.json({ success: true, message: "Password updated" });
});

app.put("/api/profile/default-location", auth, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  const { name, country, lat, lng } = req.body;
  user.defaultLocation = { name, country, lat, lng };
  res.json({ success: true, defaultLocation: user.defaultLocation });
});

app.get("/api/locations", auth, (req, res) => {
  const userLocs = locations.filter(l => l.userId === req.userId).sort((a, b) => b.createdAt - a.createdAt);
  res.json({ success: true, locations: userLocs });
});

app.post("/api/locations", auth, (req, res) => {
  const { name, country, lat, lng } = req.body;
  const existing = locations.find(l => l.userId === req.userId && l.name === name && l.country === country);
  if (existing) return res.status(400).json({ success: false, message: "Location already saved" });
  const count = locations.filter(l => l.userId === req.userId).length;
  const loc = { id: Date.now().toString(), userId: req.userId, name, country, lat, lng, isDefault: count === 0, createdAt: Date.now() };
  locations.push(loc);
  res.status(201).json({ success: true, location: loc });
});

app.delete("/api/locations/:id", auth, (req, res) => {
  const idx = locations.findIndex(l => l.id === req.params.id && l.userId === req.userId);
  if (idx === -1) return res.status(404).json({ success: false, message: "Location not found" });
  locations.splice(idx, 1);
  res.json({ success: true, message: "Location removed" });
});

app.put("/api/locations/:id/default", auth, (req, res) => {
  locations.filter(l => l.userId === req.userId).forEach(l => l.isDefault = false);
  const loc = locations.find(l => l.id === req.params.id && l.userId === req.userId);
  if (!loc) return res.status(404).json({ success: false, message: "Location not found" });
  loc.isDefault = true;
  res.json({ success: true, location: loc });
});

app.get("/api/health", (req, res) => res.json({ success: true, status: "ok", time: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Server Error" });
});

app.listen(PORT, () => {
  console.log("CARP Backend running on port " + PORT);
  console.log("Users in memory: " + users.length);
});
