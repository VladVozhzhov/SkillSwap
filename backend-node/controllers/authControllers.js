const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const registerController = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const timestamp = new Date().toISOString();
    const insert = await pool.query(
      'INSERT INTO users (email, name, password, timestamp) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, username, hashed, timestamp]
    );
    const userId = insert.rows[0].id;

    const token = jwt.sign(
      { id: userId, username: username },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    // Save the token in the DB
    await pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, userId]);

    // Clear cookie before saving
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax'
    });

    // Set token as cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    res.status(201).json({ message: 'User registered', userId: userId });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ message: err });
    console.log(err)
  }
};

const authController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0]; 
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    // Save the token in the DB
    await pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id]);

    // Clear cookie before saving
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax'
    });

    // Set token as cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction, // should be false for localhost unless using HTTPS
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    res.json({ message: 'Login successful', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error', error: err });
  }
};


const loginGoogleController = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'idToken is required' });
  }

  try {
    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const foundUser = await pool.query('SELECT id FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);

    let userId;

    if (foundUser.rows.length > 0) {
      userId = foundUser.rows[0].id;
    } else {
      const timestamp = new Date().toISOString();
      const insert = await pool.query(
        'INSERT INTO users (email, google_id, name, timestamp) VALUES ($1, $2, $3, $4) RETURNING id',
        [email, googleId, name, timestamp]
      );
      userId = insert.rows[0].id;
    }

    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    // Set token as cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    res.json({ userId });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
};

const logoutController = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'Strict', secure: true });
  res.json({ message: 'Logged out' });
};

module.exports = { 
  registerController, 
  authController, 
  logoutController,
  loginGoogleController,
};
