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

// Index for efficient querying by boardId and status
taskSchema.index({ boardId: 1, status: 1 });
taskSchema.index({ boardId: 1, position: 1 });

module.exports = mongoose.model('Task', taskSchema);