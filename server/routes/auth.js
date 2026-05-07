
const express = require('express');
const passport = require('passport');
const router = express.Router()


router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate9('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login-failed`,
    successRedirect: `${process.env.CLIENT_URL}/dashboard`
}));

router.get('/me', (req, res) => {
    if(!req.user){
        return res.status(401).json({error: 'Not authenticated'});
    }
    res({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
    });
});

router.post('/logout', (req, res) => {
    req.logout((err) => {
        if(err){
            return res.status(500).json({error: 'Logout Failed'});
        }
        res.json({success: true});
    });
});

module.exports = router;