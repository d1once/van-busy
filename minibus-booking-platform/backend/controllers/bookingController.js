// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const Minibus = require('../models/Minibus');
const Destination = require('../models/Destination');
const User = require('../models/User'); // Added User model for population

exports.createBooking = async (req, res) => {
  try {
    // Assuming req.user is populated by 'protect' middleware
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user.id; // Get user ID from authenticated user

    const { destinationId, minibusId, bookingDate } = req.body;

    // Basic Validation
    if (!destinationId || !minibusId || !bookingDate) {
      return res.status(400).json({ message: 'Destination ID, Minibus ID, and Booking Date are required.' });
    }

    // Validate Date (ensure it's not in the past, etc. - basic check for now)
    if (new Date(bookingDate) < new Date().setHours(0,0,0,0)) {
        return res.status(400).json({ message: 'Booking date cannot be in the past.' });
    }

    // Verify Destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found.' });
    }

    // Verify Minibus exists
    const minibus = await Minibus.findById(minibusId);
    if (!minibus) {
      return res.status(404).json({ message: 'Minibus not found.' });
    }

    // Basic Availability Check: No other booking for the same minibus on the same day.
    // For more precise availability, you'd compare date ranges or specific time slots.
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      minibus: minibusId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $ne: 'cancelled' } // Don't count cancelled bookings as conflicts
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Minibus not available on this date.' });
    }

    const newBooking = new Booking({
      user: userId, // Link to the authenticated user
      destination: destinationId,
      minibus: minibusId,
      // customerName and customerEmail are removed, user details are via user ref
      bookingDate: new Date(bookingDate), // Ensure it's stored as a Date object
      status: 'pending', // Default status
    });

    await newBooking.save();
    
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('user', 'username email') // Populate user details
      .populate('minibus', 'name licensePlate capacity') // Populate minibus details
      .populate('destination', 'name location price') // Populate destination details
      .exec();

    res.status(201).json({ message: 'Booking created successfully!', booking: populatedBooking });

  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.name === 'CastError') {
        return res.status(400).json({ message: `Invalid ID format for ${error.path}.` });
    }
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
};

// User: Get their own bookings
exports.getMyBookings = async (req, res) => {
  try {
    // Assuming req.user is populated by 'protect' middleware
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bookings = await Booking.find({ user: req.user.id })
      .populate('minibus', 'name licensePlate capacity imageUrl') // Populate desired minibus fields
      .populate('destination', 'name location price imageUrl') // Populate desired destination fields
      .sort({ bookingDate: -1 }); // Sort by booking date, newest first

    if (!bookings.length) {
      return res.status(200).json([]); // Return empty array if no bookings found
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Server error while fetching your bookings.' });
  }
};

// Admin: Get all bookings
exports.getAllBookingsForAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'username email') // Select fields as needed
      .populate('minibus', 'name licensePlate')
      .populate('destination', 'name location')
      .sort({ createdAt: -1 }); // Sort by creation date, newest first
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings for admin:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
};

// Admin: Get a single booking by ID
exports.getBookingByIdForAdmin = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'username email')
      .populate('minibus', 'name licensePlate capacity status')
      .populate('destination', 'name location description price status');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking by ID for admin:', error);
    if (error.name === 'CastError') {
        return res.status(400).json({ message: `Invalid ID format for booking.` });
    }
    res.status(500).json({ message: 'Server error while fetching booking.' });
  }
};

// Admin: Cancel a booking
exports.cancelBookingForAdmin = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Optionally populate details for the response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'username email')
      .populate('minibus', 'name licensePlate')
      .populate('destination', 'name location')
      .exec();

    res.status(200).json({ message: 'Booking cancelled successfully by admin.', booking: populatedBooking });
  } catch (error) {
    console.error('Error cancelling booking for admin:', error);
    if (error.name === 'CastError') {
        return res.status(400).json({ message: `Invalid ID format for booking.` });
    }
    res.status(500).json({ message: 'Server error while cancelling booking.' });
  }
};
