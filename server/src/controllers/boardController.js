const Board = require('../models/Board');
const Task = require('../models/Task');
const User = require('../models/User');

// Get board details with grouped tasks
const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Find the board that belongs to the user
    const board = await Board.findById(id);
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if the board belongs to the authenticated user
    // We need to find the user document first to get the MongoDB _id
    const user = await User.findOne({ firebaseUid: userId });
    if (!user || board.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Board does not belong to user.'
      });
    }

    // Get all tasks for this board and group them by status
    const tasks = await Task.find({ boardId: id }).sort({ position: 1 });

    // Group tasks by status
    const groupedTasks = {
      PENDING: [],
      IN_PROGRESS: [],
      DONE: []
    };

    tasks.forEach(task => {
      if (groupedTasks.hasOwnProperty(task.status)) {
        groupedTasks[task.status].push(task);
      }
    });

    res.status(200).json({
      success: true,
      board,
      tasks: groupedTasks
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching board',
      error: error.message
    });
  }
};

module.exports = {
  getBoardById
};