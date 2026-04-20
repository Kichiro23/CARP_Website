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