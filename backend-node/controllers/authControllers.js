const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const registerController = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hashed]
    );
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ message: err });
    console.log(err)
  }
};

const authController = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
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
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login error', error: err });
  }
};


const logoutController = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'Strict', secure: true });
  res.json({ message: 'Logged out' });
};

module.exports = { registerController, authController, logoutController };
