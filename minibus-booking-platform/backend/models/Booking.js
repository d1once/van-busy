const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { // Added user reference
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true,
  },
  minibus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Minibus',
    required: true,
  },
  customerName: { // Made optional
    type: String,
    required: false, 
  },
  customerEmail: { // Made optional
    type: String,
    required: false,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
