// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const Minibus = require('../models/Minibus');
const Destination = require('../models/Destination');

exports.createBooking = async (req, res) => {
  try {
    const { destinationId, minibusId, customerName, customerEmail, bookingDate } = req.body;

    // Basic Validation
    if (!destinationId || !minibusId || !customerName || !customerEmail || !bookingDate) {
      return res.status(400).json({ message: 'All fields are required.' });
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
      destination: destinationId,
      minibus: minibusId,
      customerName,
      customerEmail,
      bookingDate: new Date(bookingDate), // Ensure it's stored as a Date object
      // price: destination.price, // Example if calculating price
      status: 'pending',
    });

    await newBooking.save();
    // Populate minibus and destination details before sending back
    // For Mongoose version 6 and above, populate can be chained directly.
    // For older versions, you might need to do it separately or use .execPopulate()
    // Assuming Mongoose 6+ for simplicity here.
    const populatedBooking = await Booking.findById(newBooking._id).populate('minibus').populate('destination').exec();


    res.status(201).json({ message: 'Booking created successfully!', booking: populatedBooking });

  } catch (error) {
    console.error('Error creating booking:', error);
    // Check for CastError (e.g., invalid ObjectId format)
    if (error.name === 'CastError') {
        return res.status(400).json({ message: `Invalid ID format for ${error.path}.` });
    }
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
};
