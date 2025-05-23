const mongoose = require('mongoose');

const MinibusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'out of service'],
    default: 'active',
  },
  features: [{
    type: String,
  }],
  imageUrl: {
    type: String,
  },
});

module.exports = mongoose.model('Minibus', MinibusSchema);
