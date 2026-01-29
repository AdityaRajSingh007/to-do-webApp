const express = require('express');
const { syncAuth } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/sync - Idempotent auth sync endpoint
router.post('/sync', authMiddleware, syncAuth);

module.exports = router;