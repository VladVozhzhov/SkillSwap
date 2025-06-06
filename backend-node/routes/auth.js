const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers')
const verifyJWT = require('../middleware/verifyJWT')

router
  .post('/login', authControllers.authController)
  .post('/google', authControllers.loginGoogleController)
  .post('/register', authControllers.registerController)
  .get('/logout', authControllers.logoutController)
  .get('/check', verifyJWT, (req, res) => {
    res.sendStatus(200)
  });

module.exports = router