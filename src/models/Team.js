// src/models/Team.js
const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class Team {
  constructor(data) {
    this.id = data.id;
    this.teamName = data.teamName;
    this.email = data.email;
    this.password = data.password; // Only stored temporarily, not in Firestore
    this.authProvider = data.authProvider || null;
    this.providerData = data.providerData || null;
    this.createdAt = data.createdAt || new Date();
    this.points = data.points || 0;
    this.completedChallenges = data.completedChallenges || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Find team by email
  static async findByEmail(email) {
    try {
      const snapshot = await db.collection('teams')
        .where('email', '==', email)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return new Team({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding team by email: ' + error.message);
    }
  }

  // Find team by team name
  static async findByTeamName(teamName) {
    try {
      const snapshot = await db.collection('teams')
        .where('teamName', '==', teamName)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return new Team({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding team by team name: ' + error.message);
    }
  }

  // Find team by ID
  static async findById(id) {
    try {
      const doc = await db.collection('teams').doc(id).get();
      
      if (!doc.exists) return null;
      
      return new Team({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding team by ID: ' + error.message);
    }
  }

  // Create new team
  static async create(teamData) {
    try {
      // Check if password exists and hash it
      let hashedPassword = null;
      if (teamData.password) {
        hashedPassword = await bcrypt.hash(teamData.password, 12);
      }
      
      const newTeam = {
        teamName: teamData.teamName,
        email: teamData.email,
        authProvider: teamData.authProvider || null,
        providerData: teamData.providerData || null,
        createdAt: new Date(),
        points: 0,
        completedChallenges: [],
        isActive: true
      };

      // Only add password if it's a local auth
      if (hashedPassword) {
        newTeam.password = hashedPassword;
      }

      const teamRef = await db.collection('teams').add(newTeam);
      return new Team({ id: teamRef.id, ...newTeam });
    } catch (error) {
      throw new Error('Error creating team: ' + error.message);
    }
  }

  // Update team
  async update(updateData) {
    try {
      const updatedData = {
        ...updateData
      };

      await db.collection('teams').doc(this.id).update(updatedData);
      
      // Update current instance
      Object.assign(this, updatedData);
      return this;
    } catch (error) {
      throw new Error('Error updating team: ' + error.message);
    }
  }

  // Add points to team
  async addPoints(points) {
    try {
      const newPoints = this.points + points;
      await db.collection('teams').doc(this.id).update({
        points: newPoints
      });
      
      this.points = newPoints;
      return this;
    } catch (error) {
      throw new Error('Error adding points to team: ' + error.message);
    }
  }

  // Add completed challenge
  async addCompletedChallenge(challengeId) {
    try {
      if (!this.completedChallenges.includes(challengeId)) {
        const updatedChallenges = [...this.completedChallenges, challengeId];
        await db.collection('teams').doc(this.id).update({
          completedChallenges: updatedChallenges
        });
        
        this.completedChallenges = updatedChallenges;
      }
      return this;
    } catch (error) {
      throw new Error('Error adding completed challenge: ' + error.message);
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Get team without password
  toJSON() {
    const { password, ...teamWithoutPassword } = this;
    return teamWithoutPassword;
  }

  // Get all teams
  static async getAll(limit = 50) {
    try {
      const snapshot = await db.collection('teams')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => 
        new Team({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error('Error getting all teams: ' + error.message);
    }
  }

  // Delete team
  async delete() {
    try {
      await db.collection('teams').doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting team: ' + error.message);
    }
  }
}

module.exports = Team; 