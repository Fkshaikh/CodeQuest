const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../../shared/middleware/authMiddleware');

// Create submission
router.post('/', authMiddleware, submissionController.createSubmission);

// Get user submissions
router.get('/user', authMiddleware, submissionController.getUserSubmissions);

// Get submission by ID
router.get('/:id', authMiddleware, submissionController.getSubmissionById);

module.exports = router; 