// src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuth');

// Admin authentication
router.post('/login', adminController.login);

// Protected admin routes
router.get('/profile', adminAuthMiddleware, adminController.getProfile);
router.put('/profile', adminAuthMiddleware, adminController.updateProfile);

// Team management
router.get('/teams', adminAuthMiddleware, adminController.getAllTeams);

// Challenge management
router.get('/challenges', adminAuthMiddleware, adminController.getAllChallenges);
router.post('/challenges', adminAuthMiddleware, adminController.createChallenge);
router.put('/challenges/:id', adminAuthMiddleware, adminController.updateChallenge);

// Submission management
router.get('/submissions', adminAuthMiddleware, adminController.getAllSubmissions);

module.exports = router; 