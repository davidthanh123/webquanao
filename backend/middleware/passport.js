const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { randomUUID } = require('crypto');
const db = require('../db');

const initPassport = () => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

  // Kiểm tra bắt buộc
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    throw new Error('Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET');
  }

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://webquanao-production.up.railway.app/api/auth/google/callback'
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
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'https://webquanao-production.up.railway.app/api/auth/facebook/callback',
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