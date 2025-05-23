const Destination = require('../models/Destination');

// @desc    Create a new destination
// @route   POST /api/destinations
// @access  Admin
exports.createDestination = async (req, res) => {
  try {
    const { name, location, description, status, price, imageUrl } = req.body;
    // Basic validation for required fields
    if (!name || !location || !description || !price) {
      return res.status(400).json({ message: 'Missing required fields: name, location, description, price' });
    }
    const destination = new Destination({
      name,
      location,
      description,
      status, // Will default to 'available' if not provided, as per schema
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

// @desc    Get all destinations (Admin view - includes all statuses)
// @route   GET /api/destinations/admin (or a protected GET /api/destinations)
// @access  Admin
// For public, a new route or filtering will be applied. Renaming for clarity for now.
exports.getDestinations = async (req, res) => { // Renamed from getAllDestinations
  try {
    // Admin gets all destinations, regardless of status
    const destinations = await Destination.find({});
    res.status(200).json(destinations);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error: Could not retrieve destinations' });
  }
};

// @desc    Get a destination by ID (Admin view)
// @route   GET /api/destinations/:id
// @access  Admin
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
// @access  Admin
exports.updateDestination = async (req, res) => {
  try {
    const { name, location, description, status, price, imageUrl } = req.body;
    const destination = await Destination.findById(req.params.id);

    if (destination) {
      destination.name = name !== undefined ? name : destination.name;
      destination.location = location !== undefined ? location : destination.location;
      destination.description = description !== undefined ? description : destination.description;
      destination.status = status !== undefined ? status : destination.status;
      destination.price = price !== undefined ? price : destination.price;
      destination.imageUrl = imageUrl !== undefined ? imageUrl : destination.imageUrl; // Allow clearing imageUrl


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
// @access  Admin
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (destination) {
      await destination.deleteOne();
      res.status(200).json({ message: 'Destination removed successfully' });
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

// @desc    Get all available destinations for public users
// @route   GET /api/destinations/available
// @access  Public
exports.getAvailableDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ status: 'available' });
    res.status(200).json(destinations);
  } catch (error) {
    console.error('Error fetching available destinations:', error.message);
    res.status(500).json({ message: 'Server Error: Could not retrieve available destinations' });
  }
};
