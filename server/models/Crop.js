const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    default: "Growing stage"
  },
  status: {
    type: String,
    default: 'Active'
  },
  userId: {
    // For now, hardcode or tie it loosely since auth might not be fully fleshed
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Crop', cropSchema);
