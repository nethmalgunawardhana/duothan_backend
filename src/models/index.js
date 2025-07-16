// src/models/index.js
const User = require('./User');
const BaseModel = require('./BaseModel');
const Post = require('./Post');
const Team = require('./Team');
const Challenge = require('./Challenge');
const Submission = require('./Submission');
const Admin = require('./Admin');

module.exports = {
  User,
  BaseModel,
  Post,
  Team,
  Challenge,
  Submission,
  Admin
};