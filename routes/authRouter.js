const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Register a new user
router.post('/register', AuthController.register);

// Login user
router.post('/login', AuthController.login);

// Logout user
router.post('/logout', AuthController.logout);

// Check

module.exports = router;