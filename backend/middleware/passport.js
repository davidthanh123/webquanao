const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { randomUUID } = require('crypto');
const db = require('../db');

// Lazy load để đảm bảo env vars đã được load
const initPassport = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    let user = db.users.find(u => u.email === profile.emails[0].value);
    if (!user) {
      user = {
        id: randomUUID(),
        name: profile.displayName,
        email: profile.emails[0].value,
        password: '',
        role: 'user',
        avatar: profile.photos[0]?.value || null,
        address: [],
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
    }
    return done(null, user);
  }));

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value || `fb_${profile.id}@facebook.com`;
    let user = db.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: randomUUID(),
        name: profile.displayName,
        email,
        password: '',
        role: 'user',
        avatar: profile.photos[0]?.value || null,
        address: [],
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
    }
    return done(null, user);
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    const user = db.users.find(u => u.id === id);
    done(null, user);
  });
};

initPassport();
module.exports = passport;