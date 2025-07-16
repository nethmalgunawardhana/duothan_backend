// src/config/judge0.js
const axios = require('axios');

// Judge0 API configuration - Updated for Custom Judge0 CE instance
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://10.3.5.139:2358';
const JUDGE0_API_TOKEN = process.env.JUDGE0_API_TOKEN || 'ZHVvdGhhbjUuMA==';

// Create axios instance for Judge0 API
const judge0Api = axios.create({
  baseURL: JUDGE0_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JUDGE0_API_TOKEN}`
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
    // If no API token is set, return false
    if (!JUDGE0_API_TOKEN) {
      return false;
    }
    
    // Test connection by getting system info
    const response = await judge0Api.get('/system_info', { timeout: 5000 });
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