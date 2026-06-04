const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');

const STUDENT_STATUSES = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate Student'];

// GET /api/user/profile — current user's full profile
router.get('/profile', requireAuth, (req, res) => {
  res.json({
    name:               req.user.name,
    displayName:        req.user.displayName        || '',
    yearStatus:         req.user.yearStatus         || '',
    housingStatus:      req.user.housingStatus      || '',
    yearStatusVisible:  req.user.yearStatusVisible  ?? true,
    housingStatusVisible: req.user.housingStatusVisible ?? true,
    major:              req.user.major              || '',
    majorVisible:       req.user.majorVisible       ?? true,
    gender:             req.user.gender             || '',
    genderVisible:      req.user.genderVisible      ?? true,
    email:              req.user.email,
  });
});

// PUT /api/user/profile — update editable profile fields
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const {
      displayName,
      yearStatus,
      housingStatus,
      yearStatusVisible,
      housingStatusVisible,
      major,
      majorVisible,
      gender,
      genderVisible,
    } = req.body;

    const update = {};

    if (typeof displayName === 'string') {
      const trimmed = displayName.trim();
      if (trimmed.length > 50) {
        return res.status(400).json({ error: 'Display name must be 50 characters or fewer.' });
      }
      update.displayName = trimmed;
    }

    if (yearStatus !== undefined) update.yearStatus = yearStatus;

    if (yearStatus === 'Non-Student' || yearStatus === '') {
      update.housingStatus = '';
      update.major = '';
    } else if (housingStatus !== undefined) {
      update.housingStatus = housingStatus;
    }

    if (typeof yearStatusVisible === 'boolean') update.yearStatusVisible = yearStatusVisible;
    if (typeof housingStatusVisible === 'boolean') update.housingStatusVisible = housingStatusVisible;

    if (typeof major === 'string') {
      const trimmedMajor = major.trim();
      if (trimmedMajor.length > 120) {
        return res.status(400).json({ error: 'Major must be 120 characters or fewer.' });
      }
      update.major = trimmedMajor;
    }

    if (typeof majorVisible === 'boolean') update.majorVisible = majorVisible;

    if (typeof gender === 'string' && ['Male', 'Female', 'Non-Binary', ''].includes(gender)) update.gender = gender;
    if (typeof genderVisible === 'boolean') update.genderVisible = genderVisible;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { returnDocument: 'after' }
    );

    console.log('Profile updated:', updated.email, update);

    // Sync req.user
    Object.assign(req.user, update);

    res.json({
      name:               updated.name,
      displayName:        updated.displayName        || '',
      yearStatus:         updated.yearStatus         || '',
      housingStatus:      updated.housingStatus      || '',
      yearStatusVisible:  updated.yearStatusVisible  ?? true,
      housingStatusVisible: updated.housingStatusVisible ?? true,
      major:              updated.major              || '',
      majorVisible:       updated.majorVisible       ?? true,
      gender:             updated.gender             || '',
      genderVisible:      updated.genderVisible      ?? true,
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;