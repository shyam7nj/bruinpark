const express = require('express');
const passport = require('passport');
const router = express.Router();

// Start Google login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Handle Google callback
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: `${process.env.CLIENT_URI}/login-failed`,
  successRedirect: `${process.env.CLIENT_URI}/dashboard`
}));

// Check if user is logged in — also returns verification status
router.get('/me', (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    isVerified: req.user.isVerified,
  });
});

// Handle logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

module.exports = router;