// src/models/Admin.js
const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

class Admin {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'admin';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Find admin by email
  static async findByEmail(email) {
    try {
      const snapshot = await db.collection('admins')
        .where('email', '==', email)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return new Admin({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding admin by email: ' + error.message);
    }
  }

  // Find admin by ID
  static async findById(id) {
    try {
      const doc = await db.collection('admins').doc(id).get();
      
      if (!doc.exists) return null;
      
      return new Admin({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding admin by ID: ' + error.message);
    }
  }

  // Create new admin
  static async create(adminData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      
      const newAdmin = {
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role || 'admin',
        isActive: adminData.isActive !== undefined ? adminData.isActive : true
      };

      const adminRef = await db.collection('admins').add(newAdmin);
      return new Admin({ id: adminRef.id, ...newAdmin });
    } catch (error) {
      throw new Error('Error creating admin: ' + error.message);
    }
  }

  // Update admin
  async update(updateData) {
    try {
      // If updating password, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }
      
      await db.collection('admins').doc(this.id).update(updateData);
      
      // Update current instance
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw new Error('Error updating admin: ' + error.message);
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Get admin without password
  toJSON() {
    const { password, ...adminWithoutPassword } = this;
    return adminWithoutPassword;
  }

  // Get all admins
  static async getAll() {
    try {
      const snapshot = await db.collection('admins').get();
      
      return snapshot.docs.map(doc => 
        new Admin({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      throw new Error('Error getting all admins: ' + error.message);
    }
  }

  // Delete admin
  async delete() {
    try {
      await db.collection('admins').doc(this.id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting admin: ' + error.message);
    }
  }
}

module.exports = Admin; 