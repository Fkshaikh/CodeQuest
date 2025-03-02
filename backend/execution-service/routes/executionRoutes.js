const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');
const authMiddleware = require('../../shared/middleware/authMiddleware');

// Execute code
router.post('/', authMiddleware, executionController.executeCode);

module.exports = router; 