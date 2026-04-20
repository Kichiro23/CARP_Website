const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Location = require('../models/Location');

// @route   GET /api/locations
// @desc    Get all saved locations for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const locations = await Location.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: locations.length, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/locations
// @desc    Add a new location
// @access  Private
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('City name is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('lat').isNumeric().withMessage('Valid latitude is required'),
  body('lng').isNumeric().withMessage('Valid longitude is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, country, lat, lng } = req.body;

    // Check if location already exists for this user
    const existing = await Location.findOne({
      user: req.user._id,
      name: name,
      country: country,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Location already saved' });
    }

    // If first location, set as default
    const count = await Location.countDocuments({ user: req.user._id });
    const location = await Location.create({
      user: req.user._id,
      name,
      country,
      lat,
      lng,
      isDefault: count === 0, // First location is default
    });

    res.status(201).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/locations/:id
// @desc    Delete a location
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    // Don't allow deleting the default location without setting another
    if (location.isDefault) {
      const remaining = await Location.countDocuments({ user: req.user._id });
      if (remaining <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your only location. Add another first.',
        });
      }
      // Set another location as default
      const another = await Location.findOne({
        user: req.user._id,
        _id: { $ne: location._id },
      });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }

    await location.deleteOne();
    res.json({ success: true, message: 'Location removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/locations/:id/default
// @desc    Set location as default
// @access  Private
router.put('/:id/default', auth, async (req, res) => {
  try {
    const location = await Location.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    res.json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
