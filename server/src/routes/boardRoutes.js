const express = require('express');
const { getBoardById } = require('../controllers/boardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/boards/:id - Get board details with grouped tasks
router.get('/:id', authMiddleware, getBoardById);

module.exports = router;