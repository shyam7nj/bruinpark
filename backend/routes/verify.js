const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');
const { sendVerificationEmail, checkInboxForToken } = require('../services/mailService');

// GET /api/verify/status
router.get('/status', requireAuth, (req, res) => {
  res.json({ isVerified: req.user.isVerified });
});

// POST /api/verify/request
// Generates a token, saves it to the user, and emails them instructions
router.post('/request', requireAuth, async (req, res) => {
  if (req.user.isVerified) {
    return res.json({ isVerified: true, message: 'Already verified.' });
  }

  try {
    // Generate a short, readable token e.g. "A3F7K2"
    const token = crypto.randomBytes(3).toString('hex').toUpperCase();

    await User.findByIdAndUpdate(req.user._id, { verificationToken: token });

    await sendVerificationEmail(req.user.email, req.user.name, token);

    res.json({
      sent: true,
      message: `Verification email sent to ${req.user.email}. Follow the instructions and then click Check Verification.`,
    });
  } catch (err) {
    console.error('Error sending verification email:', err.message);
    res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
  }
});

// POST /api/verify/check
// Reads the inbox and verifies the user if their forwarded email is found
router.post('/check', requireAuth, async (req, res) => {
  if (req.user.isVerified) {
    return res.json({ isVerified: true, message: 'Already verified.' });
  }

  const token = req.user.verificationToken;

  if (!token) {
    return res.status(400).json({
      error: 'No verification request found. Please click "Send Verification Email" first.',
    });
  }

  try {
    const found = await checkInboxForToken(req.user.email, token);

    if (found) {
      const userToUpdate = await User.findById(req.user._id);
      userToUpdate.isVerified = true;
      userToUpdate.verificationToken = null;
      await userToUpdate.save();

      console.log('Verified user:', userToUpdate.email, '| isVerified:', userToUpdate.isVerified);

      req.user.isVerified = true;
      req.user.verificationToken = null;

      return res.json({
        isVerified: true,
        message: 'Permit verified! You can now create parking posts.',
      });
    }

    return res.status(400).json({
      isVerified: false,
      message:
        'Email not found yet. Make sure you forwarded the permit email to ' +
        process.env.GMAIL_USER +
        ' and that the subject contains your verification code. Wait a moment and try again.',
    });
  } catch (err) {
    console.error('Verification check error:', err.message);
    res.status(500).json({ error: 'Verification check failed. Please try again later.' });
  }
});

// POST /api/verify/admin-bypass — password-protected instant verification for admins
router.post('/admin-bypass', requireAuth, async (req, res) => {
  const { password } = req.body;

  if (password !== 'bruinpark') {
    return res.status(403).json({ error: 'Incorrect admin password.' });
  }

  try {
    const userToUpdate = await User.findById(req.user._id);
    userToUpdate.isVerified = true;
    userToUpdate.verificationToken = null;
    await userToUpdate.save();
    req.user.isVerified = true;
    res.json({ isVerified: true, message: 'Admin bypass successful.' });
  } catch (err) {
    console.error('Admin bypass error:', err.message);
    res.status(500).json({ error: 'Bypass failed. Please try again.' });
  }
});

// POST /api/verify/unverify — removes verification from the current user
router.post('/unverify', requireAuth, async (req, res) => {
  try {
    const userToUpdate = await User.findById(req.user._id);
    userToUpdate.isVerified = false;
    userToUpdate.verificationToken = null;
    await userToUpdate.save();
    req.user.isVerified = false;
    req.user.verificationToken = null;
    res.json({ isVerified: false, message: 'Verification removed.' });
  } catch (err) {
    console.error('Unverify error:', err.message);
    res.status(500).json({ error: 'Failed to remove verification.' });
  }
});

module.exports = router;