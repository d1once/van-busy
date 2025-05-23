const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  location: { // New field
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: { // New field
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
  },
});

module.exports = mongoose.model('Destination', DestinationSchema);
