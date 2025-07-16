// src/models/Challenge.js
const { db } = require('../config/firebase');

class Challenge {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.algorithmicProblem = data.algorithmicProblem || null;
    this.buildathonProblem = data.buildathonProblem || null;
    this.flag = data.flag;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.order = data.order || 1;
  }

  // Find challenge by ID
  static async findById(id) {
    try {
      const doc = await db.collection('challenges').doc(id).get();
      
      if (!doc.exists) return null;
      
      return new Challenge({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding challenge by ID: ' + error.message);
    }
  }

  // Create new challenge
  static async create(challengeData) {
    try {
      const newChallenge = {
        title: challengeData.title,
        algorithmicProblem: challengeData.algorithmicProblem || null,
        buildathonProblem: challengeData.buildathonProblem || null,
        flag: challengeData.flag,
        isActive: challengeData.isActive !== undefined ? challengeData.isActive : true,
        createdAt: new Date(),
        order: challengeData.order || 1
      };

      const challengeRef = await db.collection('challenges').add(newChallenge);
      return new Challenge({ id: challengeRef.id, ...newChallenge });
    } catch (error) {
      throw new Error('Error creating challenge: ' + error.message);
    }
  }

  // Update challenge
  async update(updateData) {
    try {
      await db.collection('challenges').doc(this.id).update(updateData);
      
      // Update current instance
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw new Error('Error updating challenge: ' + error.message);
    }
  }

  // Get all challenges
  static async getAll(limit = 50) {
    try {
      const snapshot = await db.collection('challenges')
        .orderBy('order', 'asc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => 
        new Challenge({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error('Error getting all challenges: ' + error.message);
    }
  }

  // Get active challenges
  static async getActive() {
    try {
      const snapshot = await db.collection('challenges')
        .where('isActive', '==', true)
        .orderBy('order', 'asc')
        .get();
      
      return snapshot.docs.map(doc => 
        new Challenge({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error('Error getting active challenges: ' + error.message);
    }
  }

  // Delete challenge
  async delete() {
    try {
      await db.collection('challenges').doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting challenge: ' + error.message);
    }
  }

  // Verify flag
  verifyFlag(submittedFlag) {
    return this.flag === submittedFlag;
  }
}

module.exports = Challenge; 