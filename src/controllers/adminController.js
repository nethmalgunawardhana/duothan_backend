// src/controllers/adminController.js
const { generateToken } = require('../utils/jwt');
const Admin = require('../models/Admin');

// Initialize admin account if not exists
const initializeAdmin = async () => {
  try {
    // Check if any admin exists
    const admins = await Admin.getAll();
    
    // If no admins, create a default one
    if (admins.length === 0) {
      const defaultAdmin = {
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@oasis.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isActive: true
      };
      
      await Admin.create(defaultAdmin);
      console.log('✅ Default admin account created');
    }
  } catch (error) {
    console.error('❌ Failed to initialize admin account:', error);
  }
};

// Call this function when the server starts
initializeAdmin();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Check password
    const isValidPassword = await admin.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: admin.toJSON()
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin: admin.toJSON()
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const updatedAdmin = await admin.update(req.body);

    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      admin: updatedAdmin.toJSON()
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin profile'
    });
  }
};

// Get all teams (admin only)
const getAllTeams = async (req, res) => {
  try {
    const { Team } = require('../models');
    const teams = await Team.getAll();
    
    res.json({
      success: true,
      teams: teams.map(team => team.toJSON())
    });
  } catch (error) {
    console.error('Get all teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teams'
    });
  }
};

// Get all challenges (admin only)
const getAllChallenges = async (req, res) => {
  try {
    const { Challenge } = require('../models');
    const challenges = await Challenge.getAll();
    
    res.json({
      success: true,
      challenges
    });
  } catch (error) {
    console.error('Get all challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get challenges'
    });
  }
};

// Create a challenge (admin only)
const createChallenge = async (req, res) => {
  try {
    const { Challenge } = require('../models');
    const challenge = await Challenge.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create challenge'
    });
  }
};

// Update a challenge (admin only)
const updateChallenge = async (req, res) => {
  try {
    const { Challenge } = require('../models');
    const { id } = req.params;
    
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }
    
    const updatedChallenge = await challenge.update(req.body);
    
    res.json({
      success: true,
      message: 'Challenge updated successfully',
      challenge: updatedChallenge
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge'
    });
  }
};

// Get all submissions (admin only)
const getAllSubmissions = async (req, res) => {
  try {
    const { Submission } = require('../models');
    const { db } = require('../config/firebase');
    const { challengeId } = req.query;
    
    let submissions;
    if (challengeId) {
      submissions = await Submission.getByChallengeId(challengeId);
    } else {
      // Get all submissions (limited to avoid large responses)
      const snapshot = await db.collection('submissions')
        .orderBy('submittedAt', 'desc')
        .limit(100)
        .get();
      
      submissions = snapshot.docs.map(doc => 
        new Submission({ id: doc.id, ...doc.data() })
      );
    }
    
    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions'
    });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  getAllTeams,
  getAllChallenges,
  createChallenge,
  updateChallenge,
  getAllSubmissions
}; 