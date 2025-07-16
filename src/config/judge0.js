// src/config/judge0.js
const axios = require('axios');

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

// Create axios instance for Judge0 API
const judge0Api = axios.create({
  baseURL: JUDGE0_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': JUDGE0_API_KEY,
    'X-RapidAPI-Host': JUDGE0_API_HOST
  }
});

// Language IDs for Judge0
const LANGUAGE_IDS = {
  'c': 50,
  'cpp': 54,
  'java': 62,
  'javascript': 63,
  'python': 71,
  'python3': 71,
  'go': 60,
  'csharp': 51,
  'php': 68,
  'ruby': 72,
  'rust': 73,
  'typescript': 74
};

// Test Judge0 API connection
const testJudge0Connection = async () => {
  try {
    // If no API key is set, return false
    if (!JUDGE0_API_KEY) {
      return false;
    }
    
    // Test connection by getting languages
    const response = await judge0Api.get('/languages', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('Judge0 connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  judge0Api,
  LANGUAGE_IDS,
  testJudge0Connection
}; 