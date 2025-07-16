// src/controllers/adminController.js
const { generateToken } = require('../utils/jwt');
const Admin = require('../models/Admin');

// Initialize admin account if not exists
const initializeAdmin = async () => {
  try {
    const admins = await Admin.getAll();
    
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

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
      data: {
        admin: admin.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
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
      data: admin.toJSON()
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin profile',
      error: error.message
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
      data: updatedAdmin.toJSON()
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin profile',
      error: error.message
    });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const { Team } = require('../models');
    const teams = await Team.getAll();
    
    res.json({
      success: true,
      data: teams.map(team => team.toJSON())
    });
  } catch (error) {
    console.error('Get all teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teams',
      error: error.message
    });
  }
};

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
      data: team.toJSON()
    });
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team',
      error: error.message
    });
  }
};

const createTeam = async (req, res) => {
  try {
    const { teamName, email, password } = req.body;

    if (!teamName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Team name, email, and password are required'
      });
    }

    const { Team } = require('../models');
    
    // Check if team with email already exists
    const existingTeam = await Team.findByEmail(email);
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team with this email already exists'
      });
    }

    // Check if team with name already exists
    const existingTeamName = await Team.findByTeamName(teamName);
    if (existingTeamName) {
      return res.status(400).json({
        success: false,
        message: 'Team with this name already exists'
      });
    }

    const team = await Team.create({
      teamName,
      email,
      password,
      authProvider: null,
      providerData: null
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team.toJSON()
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, email, isActive, points } = req.body;

    const { Team } = require('../models');
    const team = await Team.findById(id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== team.email) {
      const existingTeam = await Team.findByEmail(email);
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team with this email already exists'
        });
      }
    }

    // Check if team name is being changed and if new name already exists
    if (teamName && teamName !== team.teamName) {
      const existingTeamName = await Team.findByTeamName(teamName);
      if (existingTeamName) {
        return res.status(400).json({
          success: false,
          message: 'Team with this name already exists'
        });
      }
    }

    const updateData = {};
    if (teamName) updateData.teamName = teamName;
    if (email) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (points !== undefined) updateData.points = points;

    const updatedTeam = await team.update(updateData);

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam.toJSON()
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team',
      error: error.message
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const { Team } = require('../models');
    const team = await Team.findById(id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await team.delete();

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team',
      error: error.message
    });
  }
};

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

const createChallenge = async (req, res) => {
  try {
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
    const challengeData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const challenge = await Challenge.create(challengeData);
    
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

const updateChallenge = async (req, res) => {
  try {
    const { Challenge } = require('../models');
    const { id } = req.params;
    
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
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const updatedChallenge = await challenge.update(updateData);
    
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
      message: 'Failed to delete challenge',
      error: error.message
    });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const { Submission } = require('../models');
    const { db } = require('../config/firebase');
    const { challengeId, teamId, limit = 100, status } = req.query;
    
    let query = db.collection('submissions').orderBy('submittedAt', 'desc');
    
    if (challengeId) {
      query = query.where('challengeId', '==', challengeId);
    }
    
    if (teamId) {
      query = query.where('teamId', '==', teamId);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.limit(parseInt(limit)).get();
    
    const submissions = snapshot.docs.map(doc => 
      new Submission({ id: doc.id, ...doc.data() })
    );
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions',
      error: error.message
    });
  }
};

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
      data: submission
    });
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submission',
      error: error.message
    });
  }
};

const updateSubmission = async (req, res) => {
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
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const updatedSubmission = await submission.update(updateData);
    
    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: updatedSubmission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission',
      error: error.message
    });
  }
};

const getSubmissionsByTeam = async (req, res) => {
  try {
    const { Submission } = require('../models');
    const { teamId } = req.params;
    
    const submissions = await Submission.getByTeamId(teamId);
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get submissions by team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions',
      error: error.message
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const { Team, Challenge, Submission } = require('../models');
    const { db } = require('../config/firebase');
    
    const teamsSnapshot = await db.collection('teams').get();
    const totalTeams = teamsSnapshot.size;
    
    const challengesSnapshot = await db.collection('challenges').get();
    const totalChallenges = challengesSnapshot.size;
    
    const submissionsSnapshot = await db.collection('submissions').get();
    const totalSubmissions = submissionsSnapshot.size;
    
    const correctSubmissionsSnapshot = await db.collection('submissions')
      .where('status', '==', 'correct')
      .get();
    const completedSubmissions = correctSubmissionsSnapshot.size;
    
    const recentSubmissionsSnapshot = await db.collection('submissions')
      .orderBy('submittedAt', 'desc')
      .limit(5)
      .get();
    
    const recentSubmissions = recentSubmissionsSnapshot.docs.map(doc => 
      new Submission({ id: doc.id, ...doc.data() })
    );
    
    const topTeamsSnapshot = await db.collection('teams')
      .orderBy('points', 'desc')
      .limit(5)
      .get();
    
    const topTeams = topTeamsSnapshot.docs.map(doc => 
      new Team({ id: doc.id, ...doc.data() }).toJSON()
    );
    
    res.json({
      success: true,
      data: {
        totalTeams,
        totalChallenges,
        totalSubmissions,
        completedSubmissions,
        recentSubmissions,
        topTeams
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

const executeCode = async (req, res) => {
  try {
    const { executeCode } = require('../utils/judge0Service');
    const { code, language, stdin } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: code or language'
      });
    }
    
    const startTime = Date.now();
    const executionResult = await executeCode(code, language, stdin || '');
    const executionTime = Date.now() - startTime;
    
    res.json({
      success: true,
      message: 'Code executed successfully',
      data: {
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

const getTeamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { Team } = require('../models');
    const { db } = require('../config/firebase');
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get team submissions
    const submissionsSnapshot = await db.collection('submissions')
      .where('teamId', '==', id)
      .orderBy('submittedAt', 'desc')
      .limit(20)
      .get();

    const submissions = [];
    for (const doc of submissionsSnapshot.docs) {
      const submissionData = doc.data();
      
      // Get challenge details
      const challengeDoc = await db.collection('challenges').doc(submissionData.challengeId).get();
      const challengeData = challengeDoc.exists ? challengeDoc.data() : null;
      
      submissions.push({
        id: doc.id,
        challengeId: submissionData.challengeId,
        challengeTitle: challengeData ? challengeData.title : 'Unknown Challenge',
        status: submissionData.status,
        points: submissionData.points || 0,
        submittedAt: submissionData.submittedAt
      });
    }

    // Calculate team rank
    const allTeamsSnapshot = await db.collection('teams')
      .orderBy('points', 'desc')
      .get();
    
    let rank = 1;
    for (const doc of allTeamsSnapshot.docs) {
      if (doc.id === id) break;
      rank++;
    }

    // Get last activity (most recent submission)
    const lastSubmission = submissions.length > 0 ? submissions[0].submittedAt : team.createdAt;

    const teamDetails = {
      ...team.toJSON(),
      submissions,
      rank,
      lastActivity: lastSubmission
    };

    res.json({
      success: true,
      data: teamDetails
    });
  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team details',
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
  getTeamDetails,
  createTeam,
  updateTeam,
  deleteTeam,
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  getSubmissionsByTeam,
  getDashboardStats,
  executeCode
};