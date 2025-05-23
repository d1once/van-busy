const express = require('express');
const router = express.Router();
const {
  createMinibus,
  getMinibuses, // Renamed from getAllMinibuses
  getMinibusById,
  updateMinibus,
  deleteMinibus,
} = require('../controllers/minibusController');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Updated middleware

// All routes below are protected and require admin privileges

// @route   POST /api/minibuses
// @desc    Create a new minibus
// @access  Admin
router.post('/', protect, isAdmin, createMinibus);

// @route   GET /api/minibuses
// @desc    Get all minibuses
// @access  Admin
router.get('/', protect, isAdmin, getMinibuses); // Was getAllMinibuses, now protected

// @route   GET /api/minibuses/:id
// @desc    Get a single minibus by ID
// @access  Admin
router.get('/:id', protect, isAdmin, getMinibusById); // Now protected

// @route   PUT /api/minibuses/:id
// @desc    Update a minibus
// @access  Admin
router.put('/:id', protect, isAdmin, updateMinibus); // Was protectAdmin

// @route   DELETE /api/minibuses/:id
// @desc    Delete a minibus
// @access  Admin
router.delete('/:id', protect, isAdmin, deleteMinibus); // Was protectAdmin

module.exports = router;
