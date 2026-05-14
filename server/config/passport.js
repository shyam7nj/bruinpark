/*
    PassportJS Helpful Documentation:
    - https://www.passportjs.org/docs/
    - https://www.passportjs.org/packages/passport-google-oauth20/
    - https://www.passportjs.org/concepts/authentication/sessions/ (Serialization)
*/


const passport = require('passport');
// Grab the 'Strategy' constructor from the passport-google-oauth20 package (builds object for Passport)
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Tell PassportJS to use Google OAuth as a login method
passport.use(new GoogleStrategy({
    // Parameter 1:
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, 
// Parameter 2:
async(accessToken, refreshToken, profile, cb) => {
    try{
        // "Optional Chaining" and "Nullish Coalescing"
        // Step 9: https://tobiasduerschmid.github.io/SEBook/tools/nodejs.html 
        const email = profile.emails?.[0]?.value;
        const googleName = profile.displayName || `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim();

        if(!email){
            return cb(null, false, {message: 'No email returned from Google.'});
        }

       if (!email.endsWith('@ucla.edu') && !email.endsWith('@g.ucla.edu')) {
            return cb(null, false, { message: 'A UCLA email is required.' });
        }

        let user = await User.findOne({googleId: profile.id});
        /*
        In the 'name' field, if there isn't a valid name, use the user's "name" in the email, 
        to prevent Mongo from throwing an error
        */
        if(!user){
            user = await User.create({
                googleId: profile.id,
                email, 
                name: googleName || email.split('@')[0]
            });
        }
        return cb(null, user);
    }
    // If the any step fails, pass an error to Passport
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
        cb(null, user);
    }
    catch(err){
        cb(err);
    }
});

module.exports = passport;