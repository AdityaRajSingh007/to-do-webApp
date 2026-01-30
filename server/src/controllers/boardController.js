const Board = require('../models/Board');
const Task = require('../models/Task');
const User = require('../models/User');

// Get board details with grouped tasks
const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUserId = req.user.uid;

    // Find the user document to get the MongoDB _id
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the board that belongs to the user
    const board = await Board.findOne({ _id: id, userId: user._id });
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
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

// Create a new board for authenticated user
const createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const firebaseUserId = req.user.uid;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Find the user document to get the MongoDB _id
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create the new board
    const newBoard = new Board({
      userId: user._id,
      title: title
    });

    await newBoard.save();

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      board: newBoard
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating board',
      error: error.message
    });
  }
};

// Get all boards for authenticated user
const getAllBoards = async (req, res) => {
  try {
    const firebaseUserId = req.user.uid;

    // Find the user document to get the MongoDB _id
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find all boards belonging to this user
    const boards = await Board.find({ userId: user._id });

    res.status(200).json({
      success: true,
      boards: boards
    });
  } catch (error) {
    console.error('Get all boards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching boards',
      error: error.message
    });
  }
};

// Delete a board and all its associated tasks
const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUserId = req.user.uid;

    // Find the user document to get the MongoDB _id
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the board to ensure it belongs to the user
    const board = await Board.findOne({ _id: id, userId: user._id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Delete all tasks associated with this board
    await Task.deleteMany({ boardId: id });

    // Delete the board itself
    await Board.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Board and all associated tasks deleted successfully'
    });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting board',
      error: error.message
    });
  }
};

module.exports = {
  getBoardById,
  getAllBoards,
  createBoard,
  deleteBoard
};