const express = require('express');
const { getBoardById, getAllBoards, createBoard, deleteBoard } = require('../controllers/boardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/boards - Get all boards for authenticated user
router.get('/', authMiddleware, getAllBoards);

// POST /api/boards - Create a new board
router.post('/', authMiddleware, createBoard);

// GET /api/boards/:id - Get board details with grouped tasks
router.get('/:id', authMiddleware, getBoardById);

// DELETE /api/boards/:id - Delete a board and all its tasks
router.delete('/:id', authMiddleware, deleteBoard);

module.exports = router;