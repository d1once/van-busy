const Minibus = require('../models/Minibus');

// @desc    Create a new minibus
// @route   POST /api/minibuses
// @access  Private (to be implemented later)
exports.createMinibus = async (req, res) => {
  try {
    const { name, capacity, features, imageUrl } = req.body;
    const minibus = new Minibus({
      name,
      capacity,
      features,
      imageUrl,
    });
    const createdMinibus = await minibus.save();
    res.status(201).json(createdMinibus);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error: Could not create minibus' });
  }
};

// @desc    Get all minibuses
// @route   GET /api/minibuses
// @access  Public
exports.getAllMinibuses = async (req, res) => {
  try {
    const minibuses = await Minibus.find({});
    res.status(200).json(minibuses);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error: Could not retrieve minibuses' });
  }
};

// @desc    Get a minibus by ID
// @route   GET /api/minibuses/:id
// @access  Public
exports.getMinibusById = async (req, res) => {
  try {
    const minibus = await Minibus.findById(req.params.id);
    if (minibus) {
      res.status(200).json(minibus);
    } else {
      res.status(404).json({ message: 'Minibus not found' });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Minibus not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error: Could not retrieve minibus' });
  }
};

// @desc    Update a minibus by ID
// @route   PUT /api/minibuses/:id
// @access  Private (to be implemented later)
exports.updateMinibus = async (req, res) => {
  try {
    const { name, capacity, features, imageUrl } = req.body;
    const minibus = await Minibus.findById(req.params.id);

    if (minibus) {
      minibus.name = name || minibus.name;
      minibus.capacity = capacity || minibus.capacity;
      minibus.features = features || minibus.features;
      minibus.imageUrl = imageUrl || minibus.imageUrl;

      const updatedMinibus = await minibus.save();
      res.status(200).json(updatedMinibus);
    } else {
      res.status(404).json({ message: 'Minibus not found' });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Minibus not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error: Could not update minibus' });
  }
};

// @desc    Delete a minibus by ID
// @route   DELETE /api/minibuses/:id
// @access  Private (to be implemented later)
exports.deleteMinibus = async (req, res) => {
  try {
    const minibus = await Minibus.findById(req.params.id);

    if (minibus) {
      await minibus.deleteOne(); // or minibus.remove() for older Mongoose versions
      res.status(200).json({ message: 'Minibus removed' });
    } else {
      res.status(404).json({ message: 'Minibus not found' });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Minibus not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error: Could not delete minibus' });
  }
};
