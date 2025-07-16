// src/models/Submission.js
const { db } = require('../config/firebase');

class Submission {
  constructor(data) {
    this.id = data.id;
    this.teamId = data.teamId;
    this.challengeId = data.challengeId;
    this.code = data.code || null;
    this.language = data.language || null;
    this.executionResult = data.executionResult || null;
    this.flagSubmitted = data.flagSubmitted || null;
    this.isCorrect = data.isCorrect || false;
    this.githubLink = data.githubLink || null;
    this.submittedAt = data.submittedAt || new Date();
    this.executionTime = data.executionTime || null;
  }

  // Find submission by ID
  static async findById(id) {
    try {
      const doc = await db.collection('submissions').doc(id).get();
      
      if (!doc.exists) return null;
      
      return new Submission({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding submission by ID: ' + error.message);
    }
  }

  // Create new submission
  static async create(submissionData) {
    try {
      const newSubmission = {
        teamId: submissionData.teamId,
        challengeId: submissionData.challengeId,
        code: submissionData.code || null,
        language: submissionData.language || null,
        executionResult: submissionData.executionResult || null,
        flagSubmitted: submissionData.flagSubmitted || null,
        isCorrect: submissionData.isCorrect || false,
        githubLink: submissionData.githubLink || null,
        submittedAt: new Date(),
        executionTime: submissionData.executionTime || null
      };

      const submissionRef = await db.collection('submissions').add(newSubmission);
      return new Submission({ id: submissionRef.id, ...newSubmission });
    } catch (error) {
      throw new Error('Error creating submission: ' + error.message);
    }
  }

  // Update submission
  async update(updateData) {
    try {
      await db.collection('submissions').doc(this.id).update(updateData);
      
      // Update current instance
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw new Error('Error updating submission: ' + error.message);
    }
  }

  // Get submissions by team ID
  static async getByTeamId(teamId) {
    try {
      const snapshot = await db.collection('submissions')
        .where('teamId', '==', teamId)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => 
        new Submission({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error('Error getting submissions by team ID: ' + error.message);
    }
  }

  // Get submissions by challenge ID
  static async getByChallengeId(challengeId) {
    try {
      const snapshot = await db.collection('submissions')
        .where('challengeId', '==', challengeId)
        .orderBy('submittedAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => 
        new Submission({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error('Error getting submissions by challenge ID: ' + error.message);
    }
  }

  // Get submission by team ID and challenge ID
  static async getByTeamAndChallenge(teamId, challengeId) {
    try {
      const snapshot = await db.collection('submissions')
        .where('teamId', '==', teamId)
        .where('challengeId', '==', challengeId)
        .orderBy('submittedAt', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return new Submission({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error getting submission by team and challenge: ' + error.message);
    }
  }

  // Delete submission
  async delete() {
    try {
      await db.collection('submissions').doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting submission: ' + error.message);
    }
  }
}

module.exports = Submission; 