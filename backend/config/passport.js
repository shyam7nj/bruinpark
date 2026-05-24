const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, 
async(accessToken, refreshToken, profile, cb) => {
    try{
        const email = profile.emails?.[0]?.value;
        const googleName = profile.displayName || `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim();

        if(!email){
            return cb(null, false, {message: 'No email returned from Google.'});
        }

        if (!email.endsWith('@ucla.edu') && !email.endsWith('@g.ucla.edu')) {
            return cb(null, false, { message: 'A UCLA email is required.' });
        }

        let user = await User.findOne({googleId: profile.id});

        if(!user){
            user = await User.create({
                googleId: profile.id,
                email, 
                name: googleName || email.split('@')[0],
                isVerified: false,
            });
        } else if (user.isVerified === undefined || user.isVerified === null) {
            await User.updateOne({ _id: user._id }, { $set: { isVerified: false } });
            user.isVerified = false;
        }

        return cb(null, user);
    }
    catch(err){
        return cb(err);
    }
}));

passport.serializeUser((user, cb) =>{
    cb(null, user.id);
});

passport.deserializeUser(async(id, cb) => {
    try{
        const user = await User.findById(id);
        if (user && user.isVerified === undefined) {
            user.isVerified = false;
        }
        cb(null, user);
    }
    catch(err){
        cb(err);
    }
});

module.exports = passport;