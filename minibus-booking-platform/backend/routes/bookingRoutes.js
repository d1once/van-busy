const express = require('express');
const router = express.Router();
const { 
  createBooking,
  getMyBookings, // Import getMyBookings
  getAllBookingsForAdmin,
  getBookingByIdForAdmin,
  cancelBookingForAdmin 
} = require('../controllers/bookingController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- User Routes ---

// @route   POST /api/bookings
// @desc    Create a new booking (User authenticated)
// @access  Private (User)
router.post('/', protect, createBooking);

// @route   GET /api/bookings/my-bookings
// @desc    Get bookings for the authenticated user
// @access  Private (User)
router.get('/my-bookings', protect, getMyBookings);

// --- Admin Routes ---

// @route   GET /api/bookings/admin/all
// @desc    Admin: Get all bookings
// @access  Admin
router.get('/admin/all', protect, isAdmin, getAllBookingsForAdmin);

// @route   GET /api/bookings/admin/:id
// @desc    Admin: Get a specific booking by ID
// @access  Admin
router.get('/admin/:id', protect, isAdmin, getBookingByIdForAdmin);

// @route   PUT /api/bookings/admin/cancel/:id
// @desc    Admin: Cancel a booking
// @access  Admin
router.put('/admin/cancel/:id', protect, isAdmin, cancelBookingForAdmin);

module.exports = router;
