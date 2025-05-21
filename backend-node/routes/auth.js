const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers')

router.post('/auth', authControllers.authController)
router.post('/register', authControllers.registerController)
router.get('/logout', authControllers.logoutController)

module.exports = router