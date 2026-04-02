const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { randomUUID } = require('crypto');
const db = require('../db');

// Lazy load để đảm bảo env vars đã được load
const initPassport = () => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '453664751954-j46qjhlmjfmko0fpkfhesibtt2tvefmq.apps.googleusercontent.com';
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '1571755013915070';
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '0dc0c613ddcba0ce03afceeb74ecb4a2';

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    // ... phần còn lại giữ nguyên
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