const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public (for now)
router.post('/', createBooking);

module.exports = router;
