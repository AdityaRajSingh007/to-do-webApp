const Task = require('../models/Task');
const Board = require('../models/Board');
const User = require('../models/User');

// Move task between columns with fractional indexing
const moveTask = async (req, res) => {
  try {
    const { id } = req.params;  // task id
    const { boardId, status, position } = req.body;
    const firebaseUserId = req.user.uid;

    // Verify that the user exists and get the MongoDB user ID
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify that the task exists and belongs to the user's board
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify that the board exists and belongs to the user
    const board = await Board.findOne({ _id: boardId, userId: user._id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found or does not belong to user'
      });
    }

    // Update the task's status and position atomically
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { 
        status: status,
        position: position
      },
      { 
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Task moved successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Move task error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while moving task',
      error: error.message
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { boardId, title, description, status, priority, deadline, subtasks } = req.body;
    const firebaseUserId = req.user.uid;

    // Verify that the user exists and get the MongoDB user ID
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify that the board exists and belongs to the user
    const board = await Board.findOne({ _id: boardId, userId: user._id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found or does not belong to user'
      });
    }

    // Find the highest position in the target column to calculate new position
    const maxPositionTask = await Task.findOne(
      { boardId: boardId, status: status },
      { position: 1 }
    ).sort({ position: -1 });

    // Calculate new position: if no tasks exist in the column, start at 1000, otherwise add 1000 to the highest position
    const newPosition = maxPositionTask ? maxPositionTask.position + 1000 : 1000;

    // Create the new task
    const newTask = new Task({
      boardId,
      title,
      description: description || '',
      status: status || 'PENDING',
      priority: priority || 'MED',
      deadline: deadline || undefined,
      position: newPosition,
      subtasks: subtasks || []
    });

    const savedTask = await newTask.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: savedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task',
      error: error.message
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, deadline, subtasks } = req.body;
    const firebaseUserId = req.user.uid;

    // Verify that the user exists and get the MongoDB user ID
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify that the task exists and belongs to the user's board
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify that the board belongs to the user
    const board = await Board.findOne({ _id: task.boardId, userId: user._id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found or does not belong to user'
      });
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { 
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(deadline !== undefined && { deadline }),
        ...(subtasks !== undefined && { subtasks })
      },
      { 
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task',
      error: error.message
    });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUserId = req.user.uid;

    // Verify that the user exists and get the MongoDB user ID
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify that the task exists and belongs to the user's board
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify that the board belongs to the user
    const board = await Board.findOne({ _id: task.boardId, userId: user._id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found or does not belong to user'
      });
    }

    res.status(200).json({
      success: true,
      task: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task',
      error: error.message
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUserId = req.user.uid;

    // Verify that the user exists and get the MongoDB user ID
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify that the task exists and belongs to the user's board
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify that the board belongs to the user
    const board = await Board.findOne({ _id: task.boardId, userId: user._id });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found or does not belong to user'
      });
    }

    // Delete the task
    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task',
      error: error.message
    });
  }
};

module.exports = {
  moveTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskById
};