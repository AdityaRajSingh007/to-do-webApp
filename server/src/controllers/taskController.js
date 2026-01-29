const Task = require('../models/Task');
const Board = require('../models/Board');
const User = require('../models/User');

// Move task between columns with fractional indexing
const moveTask = async (req, res) => {
  try {
    const { id } = req.params;  // task id
    const { boardId, status, position } = req.body;
    const userId = req.user.uid;

    // Verify that the task exists and belongs to the user's board
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify that the board exists and belongs to the user
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const user = await User.findOne({ firebaseUid: userId });
    if (!user || board.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Board does not belong to user.'
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
    const { boardId, title, description, status, priority, subtasks } = req.body;
    const userId = req.user.uid;

    // Verify that the board exists and belongs to the user
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const user = await User.findOne({ firebaseUid: userId });
    if (!user || board.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Board does not belong to user.'
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
    const { title, description, status, priority, subtasks } = req.body;
    const userId = req.user.uid;

    // Verify that the task exists and belongs to the user's board
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify that the board belongs to the user
    const board = await Board.findById(task.boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const user = await User.findOne({ firebaseUid: userId });
    if (!user || board.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Task does not belong to user.'
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

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Verify that the task exists and belongs to the user's board
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify that the board belongs to the user
    const board = await Board.findById(task.boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const user = await User.findOne({ firebaseUid: userId });
    if (!user || board.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Task does not belong to user.'
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
  deleteTask
};