#!/bin/bash
# CARP Backend Setup Script
# Run this in your Hostinger SSH session

echo "========================================"
echo "CARP Backend Setup"
echo "========================================"

# 1. Delete old backend
echo "[1/4] Cleaning old backend..."
rm -rf ~/carp-backend

# 2. Create folder structure
echo "[2/4] Creating folder structure..."
mkdir -p ~/carp-backend/models
mkdir -p ~/carp-backend/routes

# 3. Create package.json
echo "[3/4] Creating files..."

cat > ~/carp-backend/package.json << 'PKGEOF'
{
  "name": "carp-backend",
  "version": "1.0.0",
  "description": "CARP Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.0",
    "express-validator": "^7.0.1",
    "google-auth-library": "^9.0.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "morgan": "^1.10.0",
    "nodemailer": "^6.9.7"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
PKGEOF

# 4. Create server.js
cat > ~/carp-backend/server.js << 'SRVEOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => { console.error('MongoDB Error:', err); process.exit(1); });

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', auth, require('./routes/profile'));
app.use('/api/locations', auth, require('./routes/locations'));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date() }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
SRVEOF

# 5. Create models/User.js
cat > ~/carp-backend/models/User.js << 'USREOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
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

module.exports = mongoose.model('User', userSchema);
USREOF

# 6. Create models/Location.js
cat > ~/carp-backend/models/Location.js << 'LOCEOF'
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
LOCEOF

# 7. Create routes/auth.js
cat > ~/carp-backend/routes/auth.js << 'ATHEOF'
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Invalid input' });

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, authProvider: 'local' });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider, defaultLocation: user.defaultLocation }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider, defaultLocation: user.defaultLocation }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name, email: payload.email, avatar: payload.picture || '',
        authProvider: 'google', googleId: payload.sub
      });
    }

    const jwtToken = generateToken(user._id);
    res.json({
      success: true, token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Google auth failed' });
  }
});

router.post('/forgot-password', [body('email').isEmail()], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: true, message: 'If account exists, email sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('Password reset URL:', resetUrl);

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.json({ success: true, token: jwtToken, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
ATHEOF

# 8. Create routes/profile.js
cat > ~/carp-backend/routes/profile.js << 'PRFEOF'
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, authProvider: user.authProvider, defaultLocation: user.defaultLocation } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { $set: { name, avatar } }, { new: true });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/default-location', async (req, res) => {
  try {
    const { name, country, lat, lng } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { $set: { defaultLocation: { name, country, lat, lng } } }, { new: true });
    res.json({ success: true, defaultLocation: user.defaultLocation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
PRFEOF

# 9. Create routes/locations.js
cat > ~/carp-backend/routes/locations.js << 'LCNEOF'
const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

router.get('/', async (req, res) => {
  try {
    const locations = await Location.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, country, lat, lng } = req.body;
    const existing = await Location.findOne({ user: req.userId, name, country });
    if (existing) return res.status(400).json({ success: false, message: 'Location already saved' });

    const count = await Location.countDocuments({ user: req.userId });
    const location = await Location.create({ user: req.userId, name, country, lat, lng, isDefault: count === 0 });
    res.status(201).json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const location = await Location.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, message: 'Location removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/default', async (req, res) => {
  try {
    await Location.updateMany({ user: req.userId }, { isDefault: false });
    const location = await Location.findOneAndUpdate({ _id: req.params.id, user: req.userId }, { isDefault: true }, { new: true });
    res.json({ success: true, location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
LCNEOF

# 10. Create .env file
echo "[4/4] Creating .env file..."

cat > ~/carp-backend/.env << 'ENVEOF'
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carp?retryWrites=true&w=majority
JWT_SECRET=change-this-to-a-random-string-min-32-characters
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://weathercarp.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=CARP <noreply@weathercarp.com>
ENVEOF

# 11. Verify
echo ""
echo "========================================"
echo "Files created:"
echo "========================================"
ls -la ~/carp-backend/
echo ""
echo "Models:"
ls -la ~/carp-backend/models/
echo ""
echo "Routes:"
ls -la ~/carp-backend/routes/
echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "NEXT STEPS:"
echo "1. Edit .env file: nano ~/carp-backend/.env"
echo "2. Install dependencies: cd ~/carp-backend && npm install"
echo "3. Start server: node server.js"
echo ""
echo "Test with: curl http://localhost:3001/api/health"
