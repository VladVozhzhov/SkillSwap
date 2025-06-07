const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers')
const pool = require('../config/db');
const verifyJWT = require('../middleware/verifyJWT');

router
  .post('/login', authControllers.authController)
  .post('/google', authControllers.loginGoogleController)
  .post('/register', authControllers.registerController)
  .get('/logout', authControllers.logoutController)
  .get('/check', verifyJWT, async (req, res) => { 
    try {
      const result = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const name = result.rows[0]?.name;
      res.status(200).json({ userId: req.userId, username: name });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router