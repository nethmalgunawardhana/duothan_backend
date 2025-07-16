// src/routes/submission.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth');

// All submission routes require authentication
router.use(authMiddleware);

// Code execution routes
router.post('/execute', submissionController.executeSubmission);
router.post('/flag', submissionController.submitFlag);
router.post('/github', submissionController.submitGithubLink);
router.get('/', submissionController.getTeamSubmissions);
router.get('/check/:challengeId', submissionController.checkChallengeCompletion);

module.exports = router; 