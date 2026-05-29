
const express = require('express');
const passport = require('passport');
const router = express.Router();


// Start google login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Handle google callback
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URI}/login-failed`,
    successRedirect: `${process.env.CLIENT_URI}/dashboard`
}));

// check if user is logged-in
router.get('/me', (req, res) => {
    if(!req.user){
        return res.status(401).json({error: 'Not authenticated'});
    }
    res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        isAdmin: req.user.isAdmin,
        verificationStatus: req.user.verificationStatus,
        verificationImagePath: req.user.verificationImagePath,
        verificationSubmitDate: req.user.verificationSubmitDate,
        verificationReviewDate: req.user.verificationReviewDate,
        verificationRejectionReason: req.user.verificationRejectionReason
    });
});

// handle logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if(err){
            return res.status(500).json({error: 'Logout failed'});
        }
        res.json({success: true});
    });
});

module.exports = router;