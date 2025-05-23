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
  features: [{
    type: String,
  }],
  imageUrl: {
    type: String,
  },
});

module.exports = mongoose.model('Minibus', MinibusSchema);
