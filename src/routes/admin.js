// src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuth');

// Admin authentication
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);

// Protected admin routes
router.get('/profile', adminAuthMiddleware, adminController.getProfile);
router.put('/profile', adminAuthMiddleware, adminController.updateProfile);

// Dashboard stats
router.get('/dashboard/stats', adminAuthMiddleware, adminController.getDashboardStats);

// Team management
router.get('/teams', adminAuthMiddleware, adminController.getAllTeams);
router.get('/teams/:id', adminAuthMiddleware, adminController.getTeamById);
router.get('/teams/:teamId/submissions', adminAuthMiddleware, adminController.getSubmissionsByTeam);

// Challenge management
router.get('/challenges', adminAuthMiddleware, adminController.getAllChallenges);
router.get('/challenges/:id', adminAuthMiddleware, adminController.getChallengeById);
router.post('/challenges', adminAuthMiddleware, adminController.createChallenge);
router.put('/challenges/:id', adminAuthMiddleware, adminController.updateChallenge);
router.delete('/challenges/:id', adminAuthMiddleware, adminController.deleteChallenge);

// Submission management
router.get('/submissions', adminAuthMiddleware, adminController.getAllSubmissions);
router.get('/submissions/:id', adminAuthMiddleware, adminController.getSubmissionById);

// Code execution for testing
router.post('/execute', adminAuthMiddleware, adminController.executeCode);

module.exports = router; 