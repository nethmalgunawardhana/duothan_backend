// src/controllers/submissionController.js
const { executeCode } = require('../utils/judge0Service');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const Team = require('../models/Team');

/**
 * Submit and execute code
 * @route POST /api/submissions/execute
 */
const executeSubmission = async (req, res) => {
  try {
    const { code, language, challengeId, stdin } = req.body;
    const teamId = req.user.id;

    // Validate input
    if (!code || !language || !challengeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: code, language, or challengeId'
      });
    }

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Execute code
    const startTime = Date.now();
    const executionResult = await executeCode(code, language, stdin || '');
    const executionTime = Date.now() - startTime;

    // Save submission to database
    const submission = await Submission.create({
      teamId,
      challengeId,
      code,
      language,
      executionResult,
      executionTime,
      isCorrect: false // Will be updated if flag is submitted
    });

    res.json({
      success: true,
      message: 'Code executed successfully',
      submission: {
        id: submission.id,
        executionResult,
        executionTime
      }
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message
    });
  }
};

/**
 * Submit a flag for a challenge
 * @route POST /api/submissions/flag
 */
const submitFlag = async (req, res) => {
  try {
    const { flag, challengeId } = req.body;
    const teamId = req.user.id;

    // Validate input
    if (!flag || !challengeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: flag or challengeId'
      });
    }

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if flag is correct
    const isCorrect = challenge.verifyFlag(flag);

    // Get existing submission or create new one
    let submission = await Submission.getByTeamAndChallenge(teamId, challengeId);
    
    if (submission) {
      // Update existing submission
      await submission.update({
        flagSubmitted: flag,
        isCorrect,
        submittedAt: new Date()
      });
    } else {
      // Create new submission with flag only
      submission = await Submission.create({
        teamId,
        challengeId,
        flagSubmitted: flag,
        isCorrect
      });
    }

    // If flag is correct, update team points and completed challenges
    if (isCorrect) {
      const team = await Team.findById(teamId);
      if (team) {
        await team.addPoints(challenge.points);
        await team.addCompletedChallenge(challengeId);
      }
    }

    res.json({
      success: true,
      message: isCorrect ? 'Flag is correct!' : 'Flag is incorrect',
      isCorrect,
      submission: {
        id: submission.id,
        isCorrect
      }
    });
  } catch (error) {
    console.error('Flag submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Flag submission failed',
      error: error.message
    });
  }
};

/**
 * Submit GitHub link for a challenge
 * @route POST /api/submissions/github
 */
const submitGithubLink = async (req, res) => {
  try {
    const { githubLink, challengeId } = req.body;
    const teamId = req.user.id;

    // Validate input
    if (!githubLink || !challengeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: githubLink or challengeId'
      });
    }

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Get existing submission or create new one
    let submission = await Submission.getByTeamAndChallenge(teamId, challengeId);
    
    if (submission) {
      // Update existing submission
      await submission.update({
        githubLink,
        submittedAt: new Date()
      });
    } else {
      // Create new submission with GitHub link only
      submission = await Submission.create({
        teamId,
        challengeId,
        githubLink
      });
    }

    res.json({
      success: true,
      message: 'GitHub link submitted successfully',
      submission: {
        id: submission.id,
        githubLink
      }
    });
  } catch (error) {
    console.error('GitHub link submission error:', error);
    res.status(500).json({
      success: false,
      message: 'GitHub link submission failed',
      error: error.message
    });
  }
};

/**
 * Get team's submissions
 * @route GET /api/submissions
 */
const getTeamSubmissions = async (req, res) => {
  try {
    const teamId = req.user.id;
    const { challengeId } = req.query;
    
    let submissions;
    
    if (challengeId) {
      // Get submission for specific challenge
      const submission = await Submission.getByTeamAndChallenge(teamId, challengeId);
      submissions = submission ? [submission] : [];
    } else {
      // Get all team submissions
      submissions = await Submission.getByTeamId(teamId);
    }
    
    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Get team submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions',
      error: error.message
    });
  }
};

/**
 * Check if a team has completed a challenge
 * @route GET /api/submissions/check/:challengeId
 */
const checkChallengeCompletion = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const teamId = req.user.id;

    // Validate input
    if (!challengeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing challenge ID'
      });
    }

    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if team has a successful submission for this challenge
    const submission = await Submission.getByTeamAndChallenge(teamId, challengeId);
    const isCompleted = submission ? submission.isCorrect : false;

    // Get team to check completed challenges array
    const team = await Team.findById(teamId);
    const isInCompletedList = team ? team.completedChallenges.includes(challengeId) : false;

    res.json({
      success: true,
      challengeId,
      isCompleted: isCompleted || isInCompletedList,
      submission: submission ? {
        id: submission.id,
        submittedAt: submission.submittedAt,
        isCorrect: submission.isCorrect
      } : null
    });
  } catch (error) {
    console.error('Challenge completion check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check challenge completion',
      error: error.message
    });
  }
};

module.exports = {
  executeSubmission,
  submitFlag,
  submitGithubLink,
  getTeamSubmissions,
  checkChallengeCompletion
}; 