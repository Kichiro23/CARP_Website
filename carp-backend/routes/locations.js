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