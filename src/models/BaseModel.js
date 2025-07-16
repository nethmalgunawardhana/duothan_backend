// src/models/BaseModel.js
const { db } = require('../config/firebase');

class BaseModel {
  constructor(collectionName) {
    this.collection = db.collection(collectionName);
    this.collectionName = collectionName;
  }

  // Create document
  async create(data) {
    try {
      const docData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await this.collection.add(docData);
      return { id: docRef.id, ...docData };
    } catch (error) {
      throw new Error(`Error creating ${this.collectionName}: ${error.message}`);
    }
  }

  // Find by ID
  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) return null;
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding ${this.collectionName} by ID: ${error.message}`);
    }
  }

  // Find all with optional limit
  async findAll(limit = 50) {
    try {
      const snapshot = await this.collection.limit(limit).get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error finding all ${this.collectionName}: ${error.message}`);
    }
  }

  // Update document
  async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await this.collection.doc(id).update(updateData);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating ${this.collectionName}: ${error.message}`);
    }
  }

  // Delete document
  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting ${this.collectionName}: ${error.message}`);
    }
  }

  // Find by field
  async findBy(field, value, limit = 10) {
    try {
      const snapshot = await this.collection
        .where(field, '==', value)
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error finding ${this.collectionName} by ${field}: ${error.message}`);
    }
  }
}

module.exports = BaseModel;