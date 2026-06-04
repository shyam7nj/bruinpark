
const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const MessageRequest = require('../models/MessageRequest');


// Start google login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Handle google callback
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URI}/login-failed`,
    successRedirect: `${process.env.CLIENT_URI}/dashboard`
}));

// Test login route for Playwright E2E tests (avoid Google OAuth)
router.post('/test-login', async(req, res) => {
    if(process.env.ENABLE_TEST_LOGIN !== "true"){
        return res.status(404).json({error: "Not found"});
    }

    try{
        const email = req.body.email || "test@g.ucla.edu";
        const name = req.body.name || "Test User";
        const isAdmin = req.body.isAdmin || false;
        const verificationStatus = req.body.verificationStatus || "verified";

        let user = await User.findOne({email});
        if(!user){
            user = await User.create({
                googleId: `test-${email}`,
                email,
                name,
                isAdmin,
                verificationStatus
            });
        }

        else{
            user.name = name;
            user.isAdmin = isAdmin;
            user.verificationStatus = verificationStatus;
            await user.save();
        }

        req.login(user, (err) => {
            if(err){
                return res.status(500).json({error: "Test login failed."});
            }

            return res.json({
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                verificationStatus: user.verificationStatus
            });
        });
    }
    catch(err){
        return res.status(500).json({error: err.message});
    }
});

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

// Test cleanup route — deletes a pending message request by post ID and sender email.
// Only active when ENABLE_TEST_LOGIN=true so it is never reachable in production.
router.delete('/cleanup-message-request', async (req, res) => {
    if(process.env.ENABLE_TEST_LOGIN !== "true"){
        return res.status(404).json({error: "Not found"});
    }
    try{
        const { postId, senderEmail } = req.body;
        const sender = await User.findOne({ email: senderEmail });
        if(sender){
            await MessageRequest.deleteMany({ post: postId, sender: sender._id });
        }
        res.json({ success: true });
    }
    catch(err){
        res.status(500).json({ error: "Cleanup failed" });
    }
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