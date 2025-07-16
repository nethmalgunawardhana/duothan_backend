// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Legacy user routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Team routes
router.post('/team/register', authController.registerTeam);
router.post('/team/login', authController.loginTeamOAuth);
router.post('/team/login/password', authController.loginTeam);
router.get('/team/profile', authMiddleware, authController.getTeamProfile);
router.put('/team/profile', authMiddleware, authController.updateTeamProfile);

// Team challenges (public access to active challenges)
router.get('/challenges', authController.getActiveChallenges);
router.get('/challenges/:id', authController.getChallengeById);

module.exports = router;