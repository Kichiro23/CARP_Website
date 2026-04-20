const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        defaultLocation: user.defaultLocation,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile (name, avatar)
// @access  Private
router.put('/', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.avatar) updates.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/profile/avatar
// @desc    Upload avatar image (base64)
// @access  Private
router.post('/avatar', auth, async (req, res) => {
  try {
    const { image } = req.body; // base64 image string

    if (!image) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    // For now, save base64 directly. In production, use Cloudinary.
    // TODO: Integrate Cloudinary upload here
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: image } },
      { new: true }
    );

    res.json({
      success: true,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/profile/password
// @desc    Change password (local accounts only)
// @access  Private
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Cannot change password for Google accounts' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/profile/default-location
// @desc    Update default location
// @access  Private
router.put('/default-location', auth, [
  body('name').notEmpty().withMessage('City name is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('lat').isNumeric().withMessage('Latitude must be a number'),
  body('lng').isNumeric().withMessage('Longitude must be a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, country, lat, lng } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { defaultLocation: { name, country, lat, lng } } },
      { new: true }
    );

    res.json({
      success: true,
      defaultLocation: user.defaultLocation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
