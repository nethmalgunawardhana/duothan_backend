// src/models/User.js
const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.isVerified = data.isVerified || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const snapshot = await db.collection('users')
        .where('email', '==', email)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding user by email: ' + error.message);
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const doc = await db.collection('users').doc(id).get();
      
      if (!doc.exists) return null;
      
      return new User({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding user by ID: ' + error.message);
    }
  }

  // Create new user
  static async create(userData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const newUser = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userRef = await db.collection('users').add(newUser);
      return new User({ id: userRef.id, ...newUser });
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }

  // Update user
  async update(updateData) {
    try {
      const updatedData = {
        ...updateData,
        updatedAt: new Date()
      };

      await db.collection('users').doc(this.id).update(updatedData);
      
      // Update current instance
      Object.assign(this, updatedData);
      return this;
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Get user without password
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Get all users (admin function)
  static async getAll(limit = 50) {
    try {
      const snapshot = await db.collection('users')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => 
        new User({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error('Error getting all users: ' + error.message);
    }
  }

  // Delete user
  async delete() {
    try {
      await db.collection('users').doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }
}

module.exports = User;