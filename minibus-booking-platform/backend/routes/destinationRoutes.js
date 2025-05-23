const express = require('express');
const router = express.Router();
const {
  createDestination,
  getDestinations, // Renamed from getAllDestinations
  getDestinationById,
  updateDestination,
  deleteDestination,
  getAvailableDestinations, // Import new function
} = require('../controllers/destinationController');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Updated middleware

// --- Public Routes ---

// @route   GET /api/destinations/available
// @desc    Get all available destinations for users
// @access  Public
router.get('/available', getAvailableDestinations);

// --- Admin Routes ---
// All routes below are for Admin access only

// @route   POST /api/destinations
// @desc    Admin: Create a new destination
// @access  Admin
router.post('/', protect, isAdmin, createDestination);

// @route   GET /api/destinations
// @desc    Admin: Get all destinations (includes all statuses)
// @access  Admin
router.get('/', protect, isAdmin, getDestinations); // Was getAllDestinations

// @route   GET /api/destinations/:id
// @desc    Admin: Get a single destination by ID
// @access  Admin
router.get('/:id', protect, isAdmin, getDestinationById);

// @route   PUT /api/destinations/:id
// @desc    Admin: Update a destination
// @access  Admin
router.put('/:id', protect, isAdmin, updateDestination); // Was protectAdmin

// @route   DELETE /api/destinations/:id
// @desc    Admin: Delete a destination
// @access  Admin
router.delete('/:id', protect, isAdmin, deleteDestination); // Was protectAdmin

module.exports = router;
