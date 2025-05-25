const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers')
const verifyJWT = require('../middleware/verifyJWT')

router.post('/auth', authControllers.authController)
router.post('/register', authControllers.registerController)
router.get('/logout', authControllers.logoutController)
router.get('/auth/check', verifyJWT, (req, res) => {
  res.sendStatus(200)
});

module.exports = router