const express = require('express');
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} = require('../controllers/destinationController');
const { protectAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/destinations
router.post('/', protectAdmin, createDestination);

// @route   GET /api/destinations
router.get('/', getAllDestinations);

// @route   GET /api/destinations/:id
router.get('/:id', getDestinationById);

// @route   PUT /api/destinations/:id
router.put('/:id', protectAdmin, updateDestination);

// @route   DELETE /api/destinations/:id
router.delete('/:id', protectAdmin, deleteDestination);

module.exports = router;
