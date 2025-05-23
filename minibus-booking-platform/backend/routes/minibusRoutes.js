const express = require('express');
const router = express.Router();
const {
  createMinibus,
  getAllMinibuses,
  getMinibusById,
  updateMinibus,
  deleteMinibus,
} = require('../controllers/minibusController');
const { protectAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/minibuses
router.post('/', protectAdmin, createMinibus);

// @route   GET /api/minibuses
router.get('/', getAllMinibuses);

// @route   GET /api/minibuses/:id
router.get('/:id', getMinibusById);

// @route   PUT /api/minibuses/:id
router.put('/:id', protectAdmin, updateMinibus);

// @route   DELETE /api/minibuses/:id
router.delete('/:id', protectAdmin, deleteMinibus);

module.exports = router;
