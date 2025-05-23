const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin } = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Login admin user
// @access  Public
router.post('/login', loginAdmin);

// @route   POST /api/auth/register
// @desc    Register a new admin user (for initial setup)
// @access  Public (should be restricted after initial setup)
router.post('/register', registerAdmin);

module.exports = router;
