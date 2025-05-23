const express = require('express');
const router = express.Router();
const { login, registerUser, registerAdmin } = require('../controllers/authController'); // Correctly import functions

// @route   POST /api/auth/login
// @desc    Login user or admin
// @access  Public
router.post('/login', login); // Use generic login

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser); // Correctly map to registerUser

// @route   POST /api/auth/register-admin
// @desc    Register a new admin (for initial setup or by another admin)
// @access  Potentially restricted (e.g., first admin, or by existing admin)
router.post('/register-admin', registerAdmin); // Add route for registerAdmin

module.exports = router;
