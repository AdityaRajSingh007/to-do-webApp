const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  columns: {
    type: [String],
    default: ['PENDING', 'IN_PROGRESS', 'DONE']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Board', boardSchema);