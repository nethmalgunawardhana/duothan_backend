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

// Get team by ID (admin only)
const getTeamById = async (req, res) => {
  try {
    const { Team } = require('../models');
    const { id } = req.params;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    res.json({
      success: true,
      team: team.toJSON()
    });
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team'
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
      data: challenges
    });
  } catch (error) {
    console.error('Get all challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get challenges',
      error: error.message
    });
  }
};

// Get a challenge by ID (admin only)
const getChallengeById = async (req, res) => {
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
    
    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Get challenge by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get challenge',
      error: error.message
    });
  }
};

// Create a challenge (admin only)
const createChallenge = async (req, res) => {
  try {
    // Basic validation
    const { title, description, type, difficulty, points } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    if (!['algorithmic', 'buildathon'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid challenge type. Must be algorithmic or buildathon'
      });
    }
    
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty. Must be easy, medium, or hard'
      });
    }
    
    if (points && (typeof points !== 'number' || points <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Points must be a positive number'
      });
    }
    
    const { Challenge } = require('../models');
    const challenge = await Challenge.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: challenge
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create challenge',
      error: error.message
    });
  }
};

// Update a challenge (admin only)
const updateChallenge = async (req, res) => {
  try {
    const { Challenge } = require('../models');
    const { id } = req.params;
    
    // Validate if updating type or difficulty
    const { type, difficulty, points } = req.body;
    
    if (type && !['algorithmic', 'buildathon'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid challenge type. Must be algorithmic or buildathon'
      });
    }
    
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty. Must be easy, medium, or hard'
      });
    }
    
    if (points && (typeof points !== 'number' || points <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Points must be a positive number'
      });
    }
    
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
      data: updatedChallenge
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge',
      error: error.message
    });
  }
};

// Delete a challenge (admin only)
const deleteChallenge = async (req, res) => {
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
    
    await challenge.delete();
    
    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete challenge'
    });
  }
};

// Get all submissions (admin only)
const getAllSubmissions = async (req, res) => {
  try {
    const { Submission } = require('../models');
    const { db } = require('../config/firebase');
    const { challengeId, teamId, limit = 100 } = req.query;
    
    let query = db.collection('submissions').orderBy('submittedAt', 'desc');
    
    if (challengeId) {
      query = query.where('challengeId', '==', challengeId);
    }
    
    if (teamId) {
      query = query.where('teamId', '==', teamId);
    }
    
    const snapshot = await query.limit(parseInt(limit)).get();
    
    const submissions = snapshot.docs.map(doc => 
      new Submission({ id: doc.id, ...doc.data() })
    );
    
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

// Get submission details by ID (admin only)
const getSubmissionById = async (req, res) => {
  try {
    const { Submission } = require('../models');
    const { id } = req.params;
    
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submission'
    });
  }
};

// Get submissions by team ID (admin only)
const getSubmissionsByTeam = async (req, res) => {
  try {
    const { Submission } = require('../models');
    const { teamId } = req.params;
    
    const submissions = await Submission.getByTeamId(teamId);
    
    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get submissions by team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions'
    });
  }
};

// Get dashboard stats for admin
const getDashboardStats = async (req, res) => {
  try {
    const { Team, Challenge, Submission } = require('../models');
    const { db } = require('../config/firebase');
    
    // Get total teams count
    const teamsSnapshot = await db.collection('teams').get();
    const totalTeams = teamsSnapshot.size;
    
    // Get total challenges count
    const challengesSnapshot = await db.collection('challenges').get();
    const totalChallenges = challengesSnapshot.size;
    
    // Get total submissions count
    const submissionsSnapshot = await db.collection('submissions').get();
    const totalSubmissions = submissionsSnapshot.size;
    
    // Get recent submissions
    const recentSubmissionsSnapshot = await db.collection('submissions')
      .orderBy('submittedAt', 'desc')
      .limit(5)
      .get();
    
    const recentSubmissions = recentSubmissionsSnapshot.docs.map(doc => 
      new Submission({ id: doc.id, ...doc.data() })
    );
    
    // Get top teams by points
    const topTeamsSnapshot = await db.collection('teams')
      .orderBy('points', 'desc')
      .limit(5)
      .get();
    
    const topTeams = topTeamsSnapshot.docs.map(doc => 
      new Team({ id: doc.id, ...doc.data() }).toJSON()
    );
    
    res.json({
      success: true,
      stats: {
        totalTeams,
        totalChallenges,
        totalSubmissions,
        recentSubmissions,
        topTeams
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats'
    });
  }
};

// Logout admin (just for frontend, no backend action needed)
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Execute code for testing (admin only)
const executeCode = async (req, res) => {
  try {
    const { executeCode } = require('../utils/judge0Service');
    const { code, language, stdin } = req.body;
    
    // Validate input
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: code or language'
      });
    }
    
    // Execute code
    const startTime = Date.now();
    const executionResult = await executeCode(code, language, stdin || '');
    const executionTime = Date.now() - startTime;
    
    res.json({
      success: true,
      message: 'Code executed successfully',
      result: {
        executionResult,
        executionTime
      }
    });
  } catch (error) {
    console.error('Admin code execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message
    });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  updateProfile,
  getAllTeams,
  getTeamById,
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllSubmissions,
  getSubmissionById,
  getSubmissionsByTeam,
  getDashboardStats,
  executeCode
};