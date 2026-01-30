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

// Index for efficient querying by userId (most common query pattern)
boardSchema.index({ userId: 1 });

// Additional indexes for performance optimization
boardSchema.index({ title: 1 }); // For title-based searches
boardSchema.index({ createdAt: 1 }); // For chronological ordering

module.exports = mongoose.model('Board', boardSchema);