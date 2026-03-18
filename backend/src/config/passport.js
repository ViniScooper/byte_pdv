import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getPool, sql } from '../utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const pool = await getPool();
        
        // Check if user already exists
        const existing = await pool.request()
          .input('googleId', sql.NVarChar, profile.id)
          .query('SELECT * FROM [User] WHERE googleId = @googleId');

        if (existing.recordset.length > 0) {
          return done(null, existing.recordset[0]);
        }

        // Create new user
        const newUser = await pool.request()
          .input('googleId', sql.NVarChar, profile.id)
          .input('name', sql.NVarChar, profile.displayName)
          .input('email', sql.NVarChar, profile.emails?.[0]?.value || '')
          .input('pictureUrl', sql.NVarChar, profile.photos?.[0]?.value || '')
          .query(`INSERT INTO [User] (id, googleId, name, email, pictureUrl, role)
                  OUTPUT INSERTED.*
                  VALUES (NEWID(), @googleId, @name, @email, @pictureUrl, 'CAIXA')`);

        return done(null, newUser.recordset[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
