const Destination = require('../models/Destination');

// @desc    Create a new destination
// @route   POST /api/destinations
// @access  Private (to be implemented later)
exports.createDestination = async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    const destination = new Destination({
      name,
      description,
      price,
      imageUrl,
    });
    const createdDestination = await destination.save();
    res.status(201).json(createdDestination);
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) { // Handle duplicate key error for 'name'
        return res.status(400).json({ message: 'Destination name already exists' });
    }
    res.status(500).json({ message: 'Server Error: Could not create destination' });
  }
};

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({});
    res.status(200).json(destinations);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error: Could not retrieve destinations' });
  }
};

// @desc    Get a destination by ID
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (destination) {
      res.status(200).json(destination);
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Destination not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error: Could not retrieve destination' });
  }
};

// @desc    Update a destination by ID
// @route   PUT /api/destinations/:id
// @access  Private (to be implemented later)
exports.updateDestination = async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    const destination = await Destination.findById(req.params.id);

    if (destination) {
      destination.name = name || destination.name;
      destination.description = description || destination.description;
      destination.price = price || destination.price;
      destination.imageUrl = imageUrl || destination.imageUrl;

      const updatedDestination = await destination.save();
      res.status(200).json(updatedDestination);
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Destination not found (invalid ID format)' });
    }
    if (error.code === 11000) { // Handle duplicate key error for 'name'
        return res.status(400).json({ message: 'Destination name already exists' });
    }
    res.status(500).json({ message: 'Server Error: Could not update destination' });
  }
};

// @desc    Delete a destination by ID
// @route   DELETE /api/destinations/:id
// @access  Private (to be implemented later)
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (destination) {
      await destination.deleteOne();
      res.status(200).json({ message: 'Destination removed' });
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Destination not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server Error: Could not delete destination' });
  }
};
