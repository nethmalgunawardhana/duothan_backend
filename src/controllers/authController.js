// src/controllers/authController.js
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../config/sendgrid');
const User = require('../models/User');
const Team = require('../models/Team');

// User authentication (legacy)
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({ name, email, password });
    
    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      name: user.name 
    });

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Our Platform!',
        html: `<h1>Welcome ${name}!</h1><p>Your account has been created successfully.</p>`
      });
    } catch (emailError) {
      console.warn('Email sending failed:', emailError.message);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON() // Returns user without password
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Team authentication (new)
const registerTeam = async (req, res) => {
  try {
    const { email, password, teamName, authProvider, providerData } = req.body;

    // Check if team exists with same email
    const existingTeamByEmail = await Team.findByEmail(email);
    if (existingTeamByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Team with this email already exists'
      });
    }

    // Check if team exists with same name
    const existingTeamByName = await Team.findByTeamName(teamName);
    if (existingTeamByName) {
      return res.status(400).json({
        success: false,
        message: 'Team name already taken'
      });
    }

    // Create team
    const team = await Team.create({ 
      teamName, 
      email, 
      password, 
      authProvider, 
      providerData 
    });
    
    const token = generateToken({ 
      id: team.id, 
      email: team.email,
      teamName: team.teamName,
      type: 'team'
    });

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Duothan!',
        html: `<h1>Welcome ${teamName}!</h1><p>Your team has been registered successfully.</p>`
      });
    } catch (emailError) {
      console.warn('Email sending failed:', emailError.message);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Team registered successfully',
      data: {
        token,
        team: team.toJSON() // Returns team without password
      }
    });
  } catch (error) {
    console.error('Team register error:', error);
    res.status(500).json({
      success: false,
      message: 'Team registration failed'
    });
  }
};

// OAuth-style team login (for GitHub/Google)
const loginTeamOAuth = async (req, res) => {
  try {
    const { email, authProvider, providerData } = req.body;

    if (!email || !authProvider || !providerData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required OAuth parameters'
      });
    }

    // Find team by email
    let team = await Team.findByEmail(email);
    
    if (!team) {
      // Auto-register team if not found (OAuth flow)
      const teamName = providerData.name || providerData.login || email.split('@')[0];
      
      try {
        team = await Team.create({ 
          teamName: teamName + '_' + Date.now(), // Ensure unique team name
          email, 
          authProvider, 
          providerData,
          // No password needed for OAuth
          password: null
        });
      } catch (createError) {
        console.error('Auto-registration failed:', createError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create team account'
        });
      }
    } else {
      // Update provider data for existing team
      await team.update({ providerData, authProvider });
    }

    const token = generateToken({
      id: team.id,
      email: team.email,
      teamName: team.teamName,
      type: 'team'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        team: team.toJSON()
      }
    });
  } catch (error) {
    console.error('OAuth team login error:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth login failed'
    });
  }
};

const loginTeam = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find team
    const team = await Team.findByEmail(email);
    if (!team) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await team.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      id: team.id,
      email: team.email,
      teamName: team.teamName,
      type: 'team'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        team: team.toJSON()
      }
    });
  } catch (error) {
    console.error('Team login error:', error);
    res.status(500).json({
      success: false,
      message: 'Team login failed'
    });
  }
};

const getTeamProfile = async (req, res) => {
  try {
    // Check if the user is a team
    if (req.user.type !== 'team') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a team account.'
      });
    }

    const team = await Team.findById(req.user.id);
    
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
    console.error('Get team profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team profile'
    });
  }
};

const updateTeamProfile = async (req, res) => {
  try {
    // Check if the user is a team
    if (req.user.type !== 'team') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a team account.'
      });
    }
    
    const { teamName } = req.body;
    
    // If changing team name, check if it's already taken
    if (teamName) {
      const existingTeam = await Team.findByTeamName(teamName);
      if (existingTeam && existingTeam.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Team name already taken'
        });
      }
    }
    
    const team = await Team.findById(req.user.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const updatedTeam = await team.update(req.body);

    res.json({
      success: true,
      message: 'Team profile updated successfully',
      team: updatedTeam.toJSON()
    });
  } catch (error) {
    console.error('Update team profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team profile'
    });
  }
};

// Legacy user profile methods
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await user.update({ name });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Get active challenges for teams
const getActiveChallenges = async (req, res) => {
  try {
    const Challenge = require('../models/Challenge');
    console.log('Fetching active challenges...');
    
    const challenges = await Challenge.getActive();
    console.log('Found challenges:', challenges.length);

    res.json({
      success: true,
      data: challenges || []
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
};

// Get challenge by ID for teams
const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const Challenge = require('../models/Challenge');
    
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (!challenge.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Challenge is not active'
      });
    }

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge'
    });
  }
};

module.exports = {
  // Legacy user methods
  register,
  login,
  getProfile,
  updateProfile,
  
  // Team methods
  registerTeam,
  loginTeam,
  loginTeamOAuth,
  getTeamProfile,
  updateTeamProfile,
  
  // Team challenges
  getActiveChallenges,
  getChallengeById
};