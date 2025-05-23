const Minibus = require('../models/Minibus');

// @desc    Create a new minibus
// @route   POST /api/minibuses
// @access  Admin
exports.createMinibus = async (req, res) => {
  try {
    const { name, capacity, licensePlate, status, features, imageUrl } = req.body;
    // Basic validation for required fields
    if (!name || !capacity || !licensePlate) {
      return res.status(400).json({ message: 'Missing required fields: name, capacity, licensePlate' });
    }
    const minibus = new Minibus({
      name,
      capacity,
      licensePlate,
      status, // Will default to 'active' if not provided, as per schema
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
// @access  Admin
exports.getMinibuses = async (req, res) => { // Renamed from getAllMinibuses
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
// @access  Admin
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
// @access  Admin
exports.updateMinibus = async (req, res) => {
  try {
    const { name, capacity, licensePlate, status, features, imageUrl } = req.body;
    const minibus = await Minibus.findById(req.params.id);

    if (minibus) {
      minibus.name = name !== undefined ? name : minibus.name;
      minibus.capacity = capacity !== undefined ? capacity : minibus.capacity;
      minibus.licensePlate = licensePlate !== undefined ? licensePlate : minibus.licensePlate;
      minibus.status = status !== undefined ? status : minibus.status;
      minibus.features = features !== undefined ? features : minibus.features;
      minibus.imageUrl = imageUrl !== undefined ? imageUrl : minibus.imageUrl; // Allow clearing imageUrl

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
// @access  Admin
exports.deleteMinibus = async (req, res) => {
  try {
    const minibus = await Minibus.findById(req.params.id);

    if (minibus) {
      await minibus.deleteOne();
      res.status(200).json({ message: 'Minibus removed successfully' });
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
