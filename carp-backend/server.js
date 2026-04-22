/**
 * CARP Backend - Single File Express API
 * Climate & Air Research Platform
 * BSCpE 3C 2025-2026
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ============================================
// CONFIG
// ============================================
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET not set in .env');
  process.exit(1);
}
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://weathercarp.com').replace(/\/$/, '');

// ============================================
// EXPRESS APP
// ============================================
const app = express();

app.use(cors({
  origin: [FRONTEND_URL, 'https://weathercarp.com', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ============================================
// DATABASE
// ============================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not set in .env');
  console.error('Create a .env file with: MONGODB_URI=mongodb+srv://...');
  process.exit(1);
}

let dbConnected = false;
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    dbConnected = true;
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    console.error('The server will continue running but database operations will fail.');
    console.error('Fix your MONGODB_URI password in Render Environment Variables.');
  });

// ============================================
// MODELS
// ============================================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, select: false },
  avatar: { type: String, default: '' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  defaultLocation: {
    name: { type: String, default: 'Manila' },
    country: { type: String, default: 'Philippines' },
    lat: { type: Number, default: 14.5995 },
    lng: { type: Number, default: 120.9842 },
  },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const User = mongoose.model('User', userSchema);

// Location Schema
const locationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

// ============================================
// HELPERS
// ============================================
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, authProvider: 'local' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        defaultLocation: user.defaultLocation,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        defaultLocation: user.defaultLocation,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Google OAuth
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'Google OAuth not configured on server' });
    }

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token payload' });
    }
    if (!payload.email_verified) {
      return res.status(400).json({ success: false, message: 'Google email not verified' });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture || '',
        authProvider: 'google',
        googleId: payload.sub,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.authProvider = 'google';
      if (!user.avatar && payload.picture) user.avatar = payload.picture;
      await user.save();
    }

    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        defaultLocation: user.defaultLocation,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'CARP <noreply@weathercarp.com>',
          to: user.email,
          subject: 'CARP - Password Reset Request',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#EA9D63;">CARP</h2><p>You requested a password reset.</p><a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#EA9D63,#d48952);color:white;padding:12px 24px;text-decoration:none;border-radius:12px;font-weight:bold;">Reset Password</a><p style="color:#6b6f7a;font-size:12px;margin-top:24px;">This link expires in 30 minutes.</p></div>`,
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
        return res.status(500).json({ success: false, message: 'Failed to send reset email' });
      }
    }

    res.json({ success: true, message: 'If an account exists, a reset email has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      token: jwtToken,
      message: 'Password reset successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Current User
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        defaultLocation: user.defaultLocation,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// PROFILE ROUTES
// ============================================

// Get Profile
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        defaultLocation: user.defaultLocation,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Profile
app.put('/api/profile', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Upload Avatar
app.post('/api/profile/avatar', auth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }
    if (image.length > 2_000_000) {
      return res.status(413).json({ success: false, message: 'Image too large' });
    }
    const user = await User.findByIdAndUpdate(req.userId, { avatar: image }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Change Password
app.put('/api/profile/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Cannot change password for Google accounts' });
    }
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Default Location
app.put('/api/profile/default-location', auth, async (req, res) => {
  try {
    const { name, country, lat, lng } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { defaultLocation: { name, country, lat, lng } } },
      { new: true }
    );
    res.json({ success: true, defaultLocation: user.defaultLocation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// LOCATIONS ROUTES
// ============================================

// Get All Locations
app.get('/api/locations', auth, async (req, res) => {
  try {
    const locations = await Location.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: locations.length, locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add Location
app.post('/api/locations', auth, async (req, res) => {
  try {
    const { name, country, lat, lng } = req.body;
    if (!name || !country || lat == null || lng == null) {
      return res.status(400).json({ success: false, message: 'Name, country, lat, and lng are required' });
    }

    const existing = await Location.findOne({ user: req.userId, name, country, lat, lng });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Location already saved' });
    }

    const count = await Location.countDocuments({ user: req.userId });
    const location = await Location.create({
      user: req.userId,
      name,
      country,
      lat,
      lng,
      isDefault: count === 0,
    });

    if (count === 0) {
      await User.findByIdAndUpdate(req.userId, {
        defaultLocation: { name, country, lat, lng }
      });
    }

    res.status(201).json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Location
app.delete('/api/locations/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid location ID' });
    }
    const location = await Location.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    const remaining = await Location.findOne({ user: req.userId }).sort({ createdAt: 1 });
    if (remaining) {
      await Location.findByIdAndUpdate(remaining._id, { isDefault: true });
      await User.findByIdAndUpdate(req.userId, {
        defaultLocation: { name: remaining.name, country: remaining.country, lat: remaining.lat, lng: remaining.lng }
      });
    } else {
      await User.findByIdAndUpdate(req.userId, {
        defaultLocation: { name: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842 }
      });
    }

    res.json({ success: true, message: 'Location removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Set Default Location
app.put('/api/locations/:id/default', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid location ID' });
    }
    await Location.updateMany({ user: req.userId }, { isDefault: false });
    const location = await Location.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isDefault: true },
      { new: true }
    );
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    await User.findByIdAndUpdate(req.userId, {
      defaultLocation: { name: location.name, country: location.country, lat: location.lat, lng: location.lng }
    });

    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found: ' + req.path });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  CARP Backend Server');
  console.log('  Port:', PORT);
  console.log('  MongoDB:', MONGODB_URI ? 'Configured' : 'MISSING');
  console.log('  Google OAuth:', GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured');
  console.log('  Frontend:', FRONTEND_URL);
  console.log('========================================');
});
