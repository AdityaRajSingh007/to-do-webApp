const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'IN_PROGRESS', 'DONE'],
    default: 'PENDING'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MED', 'CRIT'],
    default: 'MED'
  },
  deadline: {
    type: Date
  },
  position: {
    type: Number,
    required: true,
    default: 0
  },
  subtasks: [{
    title: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Composite index for efficient querying by boardId and status (most common query pattern)
taskSchema.index({ boardId: 1, status: 1 });

// Index for sorting by position within a board
taskSchema.index({ boardId: 1, position: 1 });

// Additional indexes for performance optimization
taskSchema.index({ boardId: 1 }); // For basic board filtering
taskSchema.index({ status: 1 }); // For status-based queries across boards
taskSchema.index({ priority: 1 }); // For priority-based queries
taskSchema.index({ deadline: 1 }); // For deadline-based queries
taskSchema.index({ createdAt: 1 }); // For chronological ordering

module.exports = mongoose.model('Task', taskSchema);