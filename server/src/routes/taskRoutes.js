const express = require('express');
const { 
  moveTask, 
  createTask, 
  updateTask, 
  deleteTask,
  getTaskById
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/todos/:id - Get a single task by ID
router.get('/:id', authMiddleware, getTaskById);

// PATCH /api/todos/:id/move - Move task between columns
router.patch('/:id/move', authMiddleware, moveTask);

// POST /api/todos - Create a new task
router.post('/', authMiddleware, createTask);

// PUT /api/todos/:id - Update a task
router.put('/:id', authMiddleware, updateTask);

// PATCH /api/todos/:id - Update a task (alternative method)
router.patch('/:id', authMiddleware, updateTask);

// DELETE /api/todos/:id - Delete a task
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;