// src/models/Post.js
const BaseModel = require('./BaseModel');

class Post extends BaseModel {
  constructor() {
    super('posts');
  }

  // Create post with user reference
  async createPost(postData, userId) {
    try {
      const post = {
        title: postData.title,
        content: postData.content,
        author: userId,
        imageUrl: postData.imageUrl || null,
        tags: postData.tags || [],
        status: postData.status || 'published', // draft, published, archived
        likes: 0,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.create(post);
    } catch (error) {
      throw new Error('Error creating post: ' + error.message);
    }
  }

  // Get posts by user
  async getPostsByUser(userId, limit = 10) {
    try {
      return await this.findBy('author', userId, limit);
    } catch (error) {
      throw new Error('Error getting posts by user: ' + error.message);
    }
  }

  // Get published posts
  async getPublishedPosts(limit = 20) {
    try {
      return await this.findBy('status', 'published', limit);
    } catch (error) {
      throw new Error('Error getting published posts: ' + error.message);
    }
  }

  // Increment likes
  async incrementLikes(postId) {
    try {
      const post = await this.findById(postId);
      if (!post) throw new Error('Post not found');

      return await this.update(postId, { 
        likes: (post.likes || 0) + 1 
      });
    } catch (error) {
      throw new Error('Error incrementing likes: ' + error.message);
    }
  }

  // Increment views
  async incrementViews(postId) {
    try {
      const post = await this.findById(postId);
      if (!post) throw new Error('Post not found');

      return await this.update(postId, { 
        views: (post.views || 0) + 1 
      });
    } catch (error) {
      throw new Error('Error incrementing views: ' + error.message);
    }
  }
}

module.exports = new Post();