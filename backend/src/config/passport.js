const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User.model');
const logger         = require('./logger');

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email  = profile.emails?.[0]?.value;
      const avatar = profile.photos?.[0]?.value;

      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

      if (user) {
        if (!user.googleId) { user.googleId = profile.id; await user.save({ validateBeforeSave: false }); }
        return done(null, user);
      }

      user = await User.create({
        googleId:        profile.id,
        name:            profile.displayName,
        email,
        avatar,
        isEmailVerified: true,
        password:        Math.random().toString(36).slice(-10) + 'Aa1!',
      });

      done(null, user);
    } catch (err) {
      logger.error(`Google OAuth error: ${err.message}`);
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) { done(err, null); }
});
